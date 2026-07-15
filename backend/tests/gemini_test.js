const http = require('http');
const assert = require('assert');

const PORT = 3000;

function request(method, path, body, token = '') {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: path,
        method: method,
        headers: headers,
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => (responseBody += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(responseBody) });
          } catch (e) {
            resolve({ status: res.statusCode, body: responseBody });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('--- STARTING GEMINI AI SCANNER TESTS ---');

  // 1. Authenticate user to get JWT token
  console.log('Logging in user...');
  const loginRes = await request('POST', '/auth/login', {
    method: 'email',
    credential: 'tester@example.com',
    displayName: 'Tester'
  });
  assert.strictEqual(loginRes.status, 200);
  const token = loginRes.body.token;

  // 2. Create a test group
  console.log('Creating group...');
  const groupRes = await request('POST', '/groups', { name: 'AI Test Group' }, token);
  assert.strictEqual(groupRes.status, 200);
  const groupId = groupRes.body.id;

  // 3. Scan Receipt - Dummy Base64
  console.log('Submitting dummy base64 receipt to scan endpoint...');
  const dummyBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; // 1x1 png base64
  const scanRes = await request('POST', `/groups/${groupId}/expenses/scan`, {
    imageBase64: dummyBase64,
    mimeType: 'image/png'
  }, token);

  console.log('Scan Response Status:', scanRes.status);
  console.log('Scan Response Body:', scanRes.body);
  
  assert.strictEqual(scanRes.status, 200);
  assert.ok(scanRes.body.merchantName);
  assert.ok(typeof scanRes.body.totalAmountCentavos === 'number');
  assert.ok(['rent', 'utilities', 'groceries', 'other'].includes(scanRes.body.category));
  assert.ok(scanRes.body.description);

  console.log('\n✅ GEMINI SCAN TEST PASSED!');
  process.exit(0);
}

run().catch(e => {
  console.error('❌ Gemini test failed:', e);
  process.exit(1);
});
