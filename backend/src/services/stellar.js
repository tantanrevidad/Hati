const StellarSdk = require('@stellar/stellar-sdk');
const db = require('../db/database');

const server = new StellarSdk.Horizon.Server(
  process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org'
);
const networkPassphrase = StellarSdk.Networks.TESTNET;

let feeBumperKeypair = null;

// Helper to fund accounts via Friendbot
async function fundAccount(publicKey) {
  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    if (!response.ok) {
      throw new Error(`Friendbot returned status ${response.status}`);
    }
  } catch (err) {
    console.error(`Warning: Failed to fund account ${publicKey} via Friendbot.`, err.message);
  }
}

// Lazy load or generate the fee-bumper account
async function getFeeBumper() {
  if (feeBumperKeypair) return feeBumperKeypair;

  const secret = process.env.FEE_BUMPER_SECRET;
  if (secret) {
    feeBumperKeypair = StellarSdk.Keypair.fromSecret(secret);
    console.log('Loaded Fee Bumper Public Key:', feeBumperKeypair.publicKey());
  } else {
    console.log('FEE_BUMPER_SECRET not set in .env. Generating a temporary testnet fee bumper...');
    feeBumperKeypair = StellarSdk.Keypair.random();
    console.log('Generated Temporary Fee Bumper Public Key:', feeBumperKeypair.publicKey());
    await fundAccount(feeBumperKeypair.publicKey());
    console.log('Temporary Fee Bumper funded successfully.');
  }
  return feeBumperKeypair;
}

/**
 * Generates custodial Stellar keys for a user, registers them, and funds the account.
 */
async function createCustodialWallet(userId) {
  const user = db.prepare('SELECT walletAddress FROM users WHERE id = ?').get(userId);
  if (user && user.walletAddress) {
    return user.walletAddress; // Already exists
  }

  // Generate random keys
  const pair = StellarSdk.Keypair.random();
  const publicKey = pair.publicKey();
  const secretKey = pair.secret();

  // Save to DB
  db.prepare('UPDATE users SET walletAddress = ?, walletSecret = ? WHERE id = ?').run(
    publicKey,
    secretKey,
    userId
  );

  // Await funding so the account is guaranteed to exist on-chain before transaction creation
  console.log(`Funding custodial wallet for user ${userId} (${publicKey}) via Friendbot...`);
  await fundAccount(publicKey);
  console.log(`Custodial wallet for user ${userId} (${publicKey}) funded successfully.`);

  return publicKey;
}

/**
 * Builds, signs, and submits a fee-bumped payment on the Stellar network.
 * amount: number in PHP centavos (e.g. 1000 = ₱10.00)
 */
async function submitStellarPayment(fromSecret, toPublicKey, amountCentavos) {
  const fromPair = StellarSdk.Keypair.fromSecret(fromSecret);
  const fromPublicKey = fromPair.publicKey();

  // Convert amount centavos to Stellar decimal units (e.g. 1000 centavos -> 10.00 XLM/USDC)
  // Stellar SDK expects a string representing the decimal amount
  const amountDecimal = (amountCentavos / 100).toFixed(7);

  // Load sender's account to get sequence number
  const sourceAccount = await server.loadAccount(fromPublicKey);

  // Build the inner transaction
  // Using native XLM for baseline, but can use USDC by providing asset object
  const innerTx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: '0', // Fee is 0 since outer fee-bump will pay it
    networkPassphrase: networkPassphrase
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: toPublicKey,
        asset: StellarSdk.Asset.native(), // XLM
        amount: amountDecimal
      })
    )
    .setTimeout(180) // 3-minute timeout
    .build();

  // Sign inner transaction with the user's custodial key
  innerTx.sign(fromPair);

  // Load fee-bumper keypair details
  const feeBumper = await getFeeBumper();

  // Wrap in a fee-bump transaction
  const feeBumpTx = StellarSdk.TransactionBuilder.buildFeeBumpTransaction(
    feeBumper.publicKey(), // pass public key string directly
    (StellarSdk.BASE_FEE * 2).toString(), // pays double base fee
    innerTx,
    networkPassphrase
  );

  // Sign outer transaction with the fee-bumper key
  feeBumpTx.sign(feeBumper);

  // Submit to Horizon
  const result = await server.submitTransaction(feeBumpTx);
  return result.hash;
}

module.exports = {
  createCustodialWallet,
  submitStellarPayment
};
