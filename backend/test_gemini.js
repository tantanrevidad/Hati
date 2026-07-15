const { parseReceipt } = require('./src/services/gemini');

async function test() {
  try {
    console.log('Testing parseReceipt with empty input...');
    const result = await parseReceipt('', 'image/jpeg');
    console.log('Success:', result);
  } catch (err) {
    console.error('Error caught during parseReceipt:', err);
  }
}

test();
