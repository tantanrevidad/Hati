const StellarSdk = require('@stellar/stellar-sdk');

const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const networkPassphrase = StellarSdk.Networks.TESTNET;

async function main() {
  // Generate a fresh keypair for a test account
  const pair = StellarSdk.Keypair.random();
  console.log('Public Key:', pair.publicKey());
  console.log('Secret Key:', pair.secret());

  // Fund it via Friendbot
  const response = await fetch(
    `https://friendbot.stellar.org?addr=${encodeURIComponent(pair.publicKey())}`
  );
  if (!response.ok) throw new Error('Friendbot funding failed');
  console.log('Account funded via Friendbot');

  // Load the account and check balance
  const account = await server.loadAccount(pair.publicKey());
  console.log('Balances:', account.balances);
}

main().catch(console.error);