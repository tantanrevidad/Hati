const db = require('../db/database');

// Lazily import the Stellar SDK only when actually needed.
// This avoids the ERR_REQUIRE_ESM crash at module load time on Vercel,
// because @stellar/stellar-sdk v16 uses @noble/hashes v2 which is ESM-only.
let _sdk = null;
async function getSdk() {
  if (!_sdk) {
    _sdk = await import('@stellar/stellar-sdk');
  }
  return _sdk;
}

// Helpers that are initialized lazily (after getSdk())
async function getServer() {
  const StellarSdk = await getSdk();
  return new StellarSdk.Horizon.Server(
    process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org'
  );
}

async function getUsdcAsset() {
  const StellarSdk = await getSdk();
  return new StellarSdk.Asset(
    'USDC',
    'GBK52AWQPRBTEDOYROFVBGVI53KQKNT3HRIZYATUQJT6FNIXR4YTK6LO'
  );
}

// Helper to fund accounts via Friendbot
async function fundAccount(publicKey) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(
        `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
      );
      if (response.ok) {
        return;
      }
      console.warn(`Friendbot funding attempt ${attempt} returned status ${response.status}. Retrying...`);
    } catch (err) {
      console.warn(`Friendbot funding attempt ${attempt} failed: ${err.message}. Retrying...`);
    }
    if (attempt < 3) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  console.error(`Warning: Failed to fund account ${publicKey} via Friendbot after 3 attempts.`);
}

let feeBumperPromise = null;

// Lazy load or generate the fee-bumper account (concurrent-safe promise cache)
async function getFeeBumper() {
  if (feeBumperPromise) return feeBumperPromise;

  feeBumperPromise = (async () => {
    const StellarSdk = await getSdk();
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
  const StellarSdk = await getSdk();
  const server = await getServer();
  const USDC_ASSET = await getUsdcAsset();
  const networkPassphrase = StellarSdk.Networks.TESTNET;

  const account = await server.loadAccount(publicKey);

  const innerTx = new StellarSdk.TransactionBuilder(account, {
    fee: '0',
    networkPassphrase
  })
    .addOperation(
      StellarSdk.Operation.changeTrust({ asset: USDC_ASSET })
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
  const StellarSdk = await getSdk();
  const server = await getServer();
  const USDC_ASSET = await getUsdcAsset();
  const networkPassphrase = StellarSdk.Networks.TESTNET;

  const issuerPair = StellarSdk.Keypair.fromSecret('SCWYHTBBU4QBWYGW2WKCOOJAQYMWFLOKRTFOPKPCS4DAKE7HIKOSYDXO');
  const issuerPublicKey = issuerPair.publicKey();
  const amountDecimal = (amountCentavos / 100).toFixed(7);

  const issuerAccount = await server.loadAccount(issuerPublicKey);
  const tx = new StellarSdk.TransactionBuilder(issuerAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase
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
  const StellarSdk = await getSdk();

  const user = await db.get('SELECT walletAddress, walletSecret FROM users WHERE id = ?', [userId]);
  if (user && user.walletAddress) {
    return user.walletAddress; // Already exists
  }

  // Generate random keys
  const pair = StellarSdk.Keypair.random();
  const publicKey = pair.publicKey();
  const secretKey = pair.secret();

  // Save to DB
  await db.run('UPDATE users SET walletAddress = ?, walletSecret = ? WHERE id = ?', [
    publicKey,
    secretKey,
    userId
  ]);

  // Await funding so the account is guaranteed to exist on-chain before transaction creation
  console.log(`Funding custodial wallet for user ${userId} (${publicKey}) via Friendbot...`);
  await fundAccount(publicKey);
  console.log(`Custodial wallet for user ${userId} (${publicKey}) funded successfully.`);

  // Synchronously establish the USDC trustline so the account can receive USDC immediately
  try {
    console.log(`Establishing USDC trustline for user ${userId} (${publicKey})...`);
    await establishUsdcTrustline(publicKey, secretKey);
    console.log(`USDC trustline established successfully for user ${userId}.`);

    // Fund the user with 100,000 USDC test balance so they have enough balance to settle debts
    console.log(`Minting 100000 USDC test balance for user ${userId} (${publicKey})...`);
    await mintUsdc(publicKey, 10000000); // 10,000,000 centavos = 100,000.00 USDC
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
  const StellarSdk = await getSdk();
  const server = await getServer();
  const USDC_ASSET = await getUsdcAsset();
  const networkPassphrase = StellarSdk.Networks.TESTNET;

  const fromPair = StellarSdk.Keypair.fromSecret(fromSecret);
  const fromPublicKey = fromPair.publicKey();
  const amountDecimal = (amountCentavos / 100).toFixed(7);

  let sourceAccount = await server.loadAccount(fromPublicKey);

  // Auto-top-up sender if their USDC balance is insufficient for this payment
  try {
    const usdcBalanceObj = sourceAccount.balances.find(b => 
      b.asset_code === USDC_ASSET.code && 
      b.asset_issuer === USDC_ASSET.issuer
    );
    const usdcBalance = parseFloat(usdcBalanceObj ? usdcBalanceObj.balance : '0');
    if (usdcBalance < parseFloat(amountDecimal)) {
      console.log(`[Stellar] Sender balance (${usdcBalance} USDC) is low. Minting additional test USDC...`);
      const topUpAmount = Math.max(amountCentavos, 10000000); // Mint at least 100,000.00 USDC
      await mintUsdc(fromPublicKey, topUpAmount);
      // Reload account to pick up the updated sequence number/balances
      sourceAccount = await server.loadAccount(fromPublicKey);
    }
  } catch (err) {
    console.warn('[Stellar] Auto-top-up check failed:', err.message);
  }

  const innerTx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: '0',
    networkPassphrase
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

  innerTx.sign(fromPair);

  const feeBumper = await getFeeBumper();

  const feeBumpTx = StellarSdk.TransactionBuilder.buildFeeBumpTransaction(
    feeBumper.publicKey(),
    (StellarSdk.BASE_FEE * 2).toString(),
    innerTx,
    networkPassphrase
  );

  feeBumpTx.sign(feeBumper);

  const result = await server.submitTransaction(feeBumpTx);
  return result.hash;
}

/**
 * Resolves SEP-10 authentication and initiates a real SEP-24 interactive deposit transaction
 * with the official SDF Test Anchor, returning the interactive portal URL.
 */
async function getInteractiveDepositUrl(userId) {
  const StellarSdk = await getSdk();

  let user = await db.get('SELECT walletAddress, walletSecret FROM users WHERE id = ?', [userId]);
  if (!user || !user.walletAddress || !user.walletSecret) {
    console.log(`Generating custodial wallet for user ${userId} on-the-fly for SEP-24 deposit...`);
    await createCustodialWallet(userId);
    user = await db.get('SELECT walletAddress, walletSecret FROM users WHERE id = ?', [userId]);
  }

  const publicKey = user.walletAddress;
  const secretKey = user.walletSecret;
  const anchorUrl = 'https://testanchor.stellar.org';

  // 1. Fetch SEP-10 Challenge Transaction
  const chalRes = await fetch(`${anchorUrl}/auth?account=${publicKey}`);
  if (!chalRes.ok) {
    throw new Error(`Failed to fetch SEP-10 challenge: ${await chalRes.text()}`);
  }
  const chalData = await chalRes.json();

  // 2. Decode and sign challenge
  const tx = new StellarSdk.Transaction(chalData.transaction, chalData.network_passphrase);
  const userPair = StellarSdk.Keypair.fromSecret(secretKey);
  tx.sign(userPair);
  const signedXdr = tx.toXDR();

  // 3. Authenticate challenge to get JWT Token
  const tokenRes = await fetch(`${anchorUrl}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transaction: signedXdr })
  });
  if (!tokenRes.ok) {
    throw new Error(`Failed to authenticate challenge: ${await tokenRes.text()}`);
  }
  const tokenData = await tokenRes.json();
  const jwtToken = tokenData.token;

  // 4. Initiate SEP-24 Interactive Deposit
  const depRes = await fetch(`${anchorUrl}/sep24/transactions/deposit/interactive`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`
    },
    body: JSON.stringify({
      asset_code: 'USDC',
      account: publicKey
    })
  });
  if (!depRes.ok) {
    throw new Error(`Failed to initiate SEP-24 interactive deposit: ${await depRes.text()}`);
  }
  const depData = await depRes.json();
  return depData.url;
}

module.exports = {
  createCustodialWallet,
  submitStellarPayment,
  getInteractiveDepositUrl
};
