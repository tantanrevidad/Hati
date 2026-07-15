const StellarSdk = require('@stellar/stellar-sdk');

async function testSep24() {
  console.log('--- TESTING SEP-24 HANDSHAKE WITH SANDBOX ANCHOR ---');
  
  // 1. Generate a temp user keypair
  const pair = StellarSdk.Keypair.random();
  const publicKey = pair.publicKey();
  console.log('User Public Key:', publicKey);

  // We need to fund the account first so the anchor knows it exists
  console.log('Funding account via Friendbot...');
  await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
  console.log('Account funded.');

  // Establish trustline so it can receive USDC
  console.log('Establishing USDC trustline...');
  const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
  const account = await server.loadAccount(publicKey);
  const USDC_ASSET = new StellarSdk.Asset('USDC', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5');
  
  const trustTx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET
  })
    .addOperation(StellarSdk.Operation.changeTrust({ asset: USDC_ASSET }))
    .setTimeout(180)
    .build();
  trustTx.sign(pair);
  await server.submitTransaction(trustTx);
  console.log('Trustline established.');

  const anchorUrl = 'https://testanchor.stellar.org';

  // 2. Fetch SEP-10 Challenge
  console.log('\nStep 1: Fetching SEP-10 challenge transaction...');
  const chalUrl = `${anchorUrl}/auth?account=${publicKey}`;
  const chalRes = await fetch(chalUrl);
  if (!chalRes.ok) {
    throw new Error(`Failed to fetch challenge: ${await chalRes.text()}`);
  }
  const chalData = await chalRes.json();
  console.log('Challenge received.');

  // 3. Decode & Sign Challenge
  console.log('\nStep 2: Decoding and signing challenge...');
  const tx = new StellarSdk.Transaction(chalData.transaction, chalData.network_passphrase);
  tx.sign(pair);
  const signedXdr = tx.toXDR();

  // 4. Submit signed challenge to get JWT token
  console.log('\nStep 3: Submitting signed challenge for JWT...');
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
  console.log('JWT Token received:', jwtToken.slice(0, 20) + '...');

  // 5. Initiate SEP-24 Interactive Deposit
  console.log('\nStep 4: Initiating SEP-24 Interactive Deposit...');
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
    throw new Error(`Failed to initiate deposit: ${await depRes.text()}`);
  }
  const depData = await depRes.json();
  console.log('Interactive Deposit Success!');
  console.log('Interactive URL:', depData.url);
  process.exit(0);
}

testSep24().catch(err => {
  console.error('❌ SEP-24 Handshake failed:', err);
  process.exit(1);
});
