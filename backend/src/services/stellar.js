const StellarSdk = require('@stellar/stellar-sdk');
const db = require('../db/database');

const server = new StellarSdk.Horizon.Server(
  process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org'
);
const networkPassphrase = StellarSdk.Networks.TESTNET;

const USDC_ASSET = new StellarSdk.Asset(
  'USDC',
  'GBK52AWQPRBTEDOYROFVBGVI53KQKNT3HRIZYATUQJT6FNIXR4YTK6LO'
);

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

let feeBumperPromise = null;

// Lazy load or generate the fee-bumper account (concurrent-safe promise cache)
async function getFeeBumper() {
  if (feeBumperPromise) return feeBumperPromise;

  feeBumperPromise = (async () => {
    const secret = process.env.FEE_BUMPER_SECRET;
    if (secret) {
      const keypair = StellarSdk.Keypair.fromSecret(secret);
      console.log('Loaded Fee Bumper Public Key:', keypair.publicKey());
      return keypair;
    } else {
      console.log('FEE_BUMPER_SECRET not set in .env. Generating a temporary testnet fee bumper...');
      const keypair = StellarSdk.Keypair.random();
      console.log('Generated Temporary Fee Bumper Public Key:', keypair.publicKey());
      await fundAccount(keypair.publicKey());
      console.log('Temporary Fee Bumper funded successfully.');
      return keypair;
    }
  })();

  return feeBumperPromise;
}

/**
 * Submits a fee-bumped changeTrust transaction to establish a USDC trustline for a custodial account.
 */
async function establishUsdcTrustline(publicKey, secretKey) {
  const account = await server.loadAccount(publicKey);

  const innerTx = new StellarSdk.TransactionBuilder(account, {
    fee: '0',
    networkPassphrase: networkPassphrase
  })
    .addOperation(
      StellarSdk.Operation.changeTrust({
        asset: USDC_ASSET
      })
    )
    .setTimeout(180)
    .build();

  const userPair = StellarSdk.Keypair.fromSecret(secretKey);
  innerTx.sign(userPair);

  const feeBumper = await getFeeBumper();

  const feeBumpTx = StellarSdk.TransactionBuilder.buildFeeBumpTransaction(
    feeBumper.publicKey(),
    (StellarSdk.BASE_FEE * 2).toString(),
    innerTx,
    networkPassphrase
  );

  feeBumpTx.sign(feeBumper);

  await server.submitTransaction(feeBumpTx);
}

let issuerQueuePromise = Promise.resolve();

/**
 * Mints custom USDC stablecoin to the target account from the issuer.
 * Uses a promise queue to serialize transaction submission and prevent sequence conflicts.
 */
async function mintUsdc(toPublicKey, amountCentavos) {
  return new Promise((resolve, reject) => {
    issuerQueuePromise = issuerQueuePromise.then(async () => {
      try {
        const hash = await executeMintUsdc(toPublicKey, amountCentavos);
        resolve(hash);
      } catch (err) {
        reject(err);
      }
    });
  });
}

/**
 * Raw execution of the issuer payment on Stellar.
 */
async function executeMintUsdc(toPublicKey, amountCentavos) {
  const issuerPair = StellarSdk.Keypair.fromSecret('SCWYHTBBU4QBWYGW2WKCOOJAQYMWFLOKRTFOPKPCS4DAKE7HIKOSYDXO');
  const issuerPublicKey = issuerPair.publicKey();
  const amountDecimal = (amountCentavos / 100).toFixed(7);

  const issuerAccount = await server.loadAccount(issuerPublicKey);
  const tx = new StellarSdk.TransactionBuilder(issuerAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: networkPassphrase
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: toPublicKey,
        asset: USDC_ASSET,
        amount: amountDecimal
      })
    )
    .setTimeout(180)
    .build();

  tx.sign(issuerPair);
  const result = await server.submitTransaction(tx);
  return result.hash;
}

/**
 * Generates custodial Stellar keys for a user, registers them, and funds the account.
 */
async function createCustodialWallet(userId) {
  const user = db.prepare('SELECT walletAddress, walletSecret FROM users WHERE id = ?').get(userId);
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

  // Synchronously establish the USDC trustline so the account can receive USDC immediately
  try {
    console.log(`Establishing USDC trustline for user ${userId} (${publicKey})...`);
    await establishUsdcTrustline(publicKey, secretKey);
    console.log(`USDC trustline established successfully for user ${userId}.`);

    // Fund the user with 1000 USDC test balance so they have enough balance to settle debts
    console.log(`Minting 1000 USDC test balance for user ${userId} (${publicKey})...`);
    await mintUsdc(publicKey, 100000); // 100,000 centavos = 1,000.00 USDC
    console.log(`Successfully minted 1000 USDC test balance for user ${userId}.`);
  } catch (err) {
    console.error(`Failed to initialize USDC for user ${userId}:`, err);
    throw err;
  }

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
        asset: USDC_ASSET, // USDC stablecoin
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
