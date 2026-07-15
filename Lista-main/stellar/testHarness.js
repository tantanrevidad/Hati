const StellarSdk = require('@stellar/stellar-sdk');

const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const networkPassphrase = StellarSdk.Networks.TESTNET;

async function fundAccount(publicKey) {
  const response = await fetch(
    `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
  );
  if (!response.ok) throw new Error(`Friendbot funding failed for ${publicKey}`);
}

async function main() {
  console.log('Script started');

  // 1. Generate two accounts — sender (A) and receiver (B)
  const senderPair = StellarSdk.Keypair.random();
  const receiverPair = StellarSdk.Keypair.random();

  console.log('Sender Public Key:', senderPair.publicKey());
  console.log('Receiver Public Key:', receiverPair.publicKey());

  // 2. Fund both via Friendbot
  await fundAccount(senderPair.publicKey());
  await fundAccount(receiverPair.publicKey());
  console.log('Both accounts funded');

  // 3. Load sender's account (need current sequence number)
  const senderAccount = await server.loadAccount(senderPair.publicKey());

  // 4. Build the payment transaction
  const transaction = new StellarSdk.TransactionBuilder(senderAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: networkPassphrase,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: receiverPair.publicKey(),
        asset: StellarSdk.Asset.native(), // XLM
        amount: '10', // sending 10 test XLM
      })
    )
    .setTimeout(30)
    .build();

  // 5. Sign with sender's secret key
  transaction.sign(senderPair);

  // 6. Submit to Horizon
  const result = await server.submitTransaction(transaction);
  console.log('Transaction successful! Hash:', result.hash);
  console.log('View on Stellar Expert:', `https://stellar.expert/explorer/testnet/tx/${result.hash}`);

  // 7. Confirm updated balances
  const updatedSender = await server.loadAccount(senderPair.publicKey());
  const updatedReceiver = await server.loadAccount(receiverPair.publicKey());

  console.log('Sender balances:', updatedSender.balances);
  console.log('Receiver balances:', updatedReceiver.balances);
}

main().catch((err) => {
  console.error('Error:', err.response ? err.response.data : err);
});