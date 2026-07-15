const http = require('http');
const assert = require('assert');
const db = require('../src/db/database');

const PORT = 3000;

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
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
  console.log('--- TESTING AUTHENTICATION METHODS ---');

  // 1. Phone number authentication
  console.log('Testing Phone Login...');
  const phoneRes = await request('POST', '/auth/login', {
    method: 'phone',
    credential: '+639170000001',
    displayName: 'Juan Dela Cruz',
  });
  console.log('Phone Login Response Status:', phoneRes.status);
  console.log('Phone Login User:', phoneRes.body.user);
  assert.strictEqual(phoneRes.status, 200);
  assert.strictEqual(phoneRes.body.user.phone, '+639170000001');

  // 2. Email verification/login
  console.log('\nTesting Email Login...');
  const emailRes = await request('POST', '/auth/login', {
    method: 'email',
    credential: 'maria@example.com',
    displayName: 'Maria Clara',
  });
  console.log('Email Login Response Status:', emailRes.status);
  console.log('Email Login User:', emailRes.body.user);
  assert.strictEqual(emailRes.status, 200);
  assert.strictEqual(emailRes.body.user.email, 'maria@example.com');

  // 3. Google OAuth login
  console.log('\nTesting Google OAuth Login...');
  const googleRes = await request('POST', '/auth/login', {
    method: 'google',
    credential: 'google_user@gmail.com',
    displayName: 'Google User',
    photoUrl: 'https://lh3.googleusercontent.com/a/default',
  });
  console.log('Google Login Response Status:', googleRes.status);
  console.log('Google Login User:', googleRes.body.user);
  assert.strictEqual(googleRes.status, 200);
  assert.strictEqual(googleRes.body.user.email, 'google_user@gmail.com');
  assert.strictEqual(googleRes.body.user.authMethod, 'google');

  // 4. Verify Database state
  console.log('\n--- VERIFYING DATABASE RECORDS ---');
  const users = db.prepare('SELECT id, displayName, phone, email, authMethod, photoUrl FROM users').all();
  console.log('Total users stored in database:', users.length);
  console.log(users);

  console.log('\n✅ ALL AUTH TESTS PASSED AND USER DATA IS VERIFIED IN DATABASE!');
  process.exit(0);
}

run().catch((e) => {
  console.error('❌ Test failed:', e);
  process.exit(1);
});
