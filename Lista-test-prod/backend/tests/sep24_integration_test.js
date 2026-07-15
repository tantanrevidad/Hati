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
  console.log('--- RUNNING SEP-24 ENDPOINT INTEGRATION TEST ---');

  // 1. Log in / register user
  const email = `sep24_user_${Date.now()}@test.com`;
  console.log(`Logging in user: ${email}...`);
  const loginRes = await request('POST', '/auth/login', {
    method: 'email',
    credential: email,
    displayName: 'SEP-24 Test User'
  });
  
  assert.strictEqual(loginRes.status, 200);
  const token = loginRes.body.token;
  console.log('User registered & token acquired.');

  // 2. Fetch the interactive deposit URL
  console.log('Requesting interactive deposit URL from GET/POST endpoint...');
  const depRes = await request('POST', '/users/me/deposit', {}, token);

  console.log('Response Status:', depRes.status);
  console.log('Response Body:', depRes.body);

  assert.strictEqual(depRes.status, 200);
  assert.ok(depRes.body.url);
  assert.ok(depRes.body.url.startsWith('https://'));
  
  console.log('✅ SEP-24 INTEGRATION TEST PASSED! INTERACTIVE DEPOSIT URL ACQUIRED SUCCESSFULLY.');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ SEP-24 Integration Test Failed:', err);
  process.exit(1);
});
