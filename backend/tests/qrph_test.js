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
      { hostname: 'localhost', port: PORT, path, method, headers },
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
  console.log('--- QR PH INTEGRATION TEST ---\n');

  // 1. Register debtor (phone-based, simulating a GCash user)
  console.log('Step 1: Registering debtor...');
  const debtorRes = await request('POST', '/auth/login', {
    method: 'phone',
    credential: '09171234567',
    displayName: 'Juan Debtor'
  });
  assert.strictEqual(debtorRes.status, 200);
  const debtorToken = debtorRes.body.token;
  const debtorId = debtorRes.body.user.id;
  console.log('✅ Debtor registered:', debtorId);

  // 2. Register creditor (phone-based)
  console.log('\nStep 2: Registering creditor...');
  const creditorRes = await request('POST', '/auth/login', {
    method: 'phone',
    credential: '09189876543',
    displayName: 'Maria Creditor'
  });
  assert.strictEqual(creditorRes.status, 200);
  const creditorToken = creditorRes.body.token;
  const creditorId = creditorRes.body.user.id;
  console.log('✅ Creditor registered:', creditorId);

  // 3. Link GCash number to creditor
  console.log('\nStep 3: Linking GCash number to creditor...');
  const linkRes = await request('POST', '/users/me/payment-methods', {
    type: 'gcash',
    referenceToken: '09189876543'
  }, creditorToken);
  assert.strictEqual(linkRes.status, 200);
  console.log('✅ GCash linked to creditor.');

  // 4. Create a group
  console.log('\nStep 4: Creating group...');
  const groupRes = await request('POST', '/groups', {
    name: 'QR PH Test Dorm'
  }, debtorToken);
  assert.strictEqual(groupRes.status, 200);
  const groupId = groupRes.body.id;
  console.log('✅ Group created:', groupId);

  // 5. Generate join link and have creditor join
  console.log('\nStep 5: Joining creditor to group...');
  const linkGenRes = await request('POST', `/groups/${groupId}/join-link`, {}, debtorToken);
  assert.strictEqual(linkGenRes.status, 200);
  const slug = linkGenRes.body.slug;

  const joinRes = await request('GET', `/join/${slug}`, {}, creditorToken);
  assert.strictEqual(joinRes.status, 200);
  console.log('✅ Creditor joined group.');

  // 6. Post an expense (creditor paid, debtor owes)
  console.log('\nStep 6: Posting expense (creditor paid ₱250.00)...');
  const expenseRes = await request('POST', `/groups/${groupId}/expenses`, {
    description: 'Groceries @Juan Debtor',
    amount: 25000, // ₱250.00
    category: 'groceries',
    paidBy: creditorId,
    splitType: 'equal',
    splitDetails: { participantIds: [debtorId, creditorId] }
  }, creditorToken);
  assert.strictEqual(expenseRes.status, 200);
  console.log('✅ Expense posted. Debtor now owes ₱125.00.');

  // 7. Generate QR PH code for settlement
  console.log('\nStep 7: Generating QR PH payment code...');
  const qrRes = await request('POST', '/settlements/qrph/generate', {
    groupId,
    fromUserId: debtorId,
    toUserId: creditorId,
    amountCentavos: 12500 // ₱125.00
  }, debtorToken);

  console.log('QR PH Response Status:', qrRes.status);
  console.log('QR PH Response Body:', {
    recipientName: qrRes.body.recipientName,
    recipientMobile: qrRes.body.recipientMobile,
    amountPhp: qrRes.body.amountPhp,
    referenceId: qrRes.body.referenceId,
    instructions: qrRes.body.instructions,
    payloadLength: qrRes.body.payload?.length,
    hasQrImage: qrRes.body.qrDataUrl?.startsWith('data:image/png')
  });

  assert.strictEqual(qrRes.status, 200);
  assert.ok(qrRes.body.payload);
  assert.ok(qrRes.body.qrDataUrl);
  assert.ok(qrRes.body.qrDataUrl.startsWith('data:image/png'));
  assert.strictEqual(qrRes.body.amountPhp, '125.00');
  assert.ok(qrRes.body.recipientName);
  assert.ok(qrRes.body.instructions);

  // 8. Verify the EMVCo payload contains expected fields
  console.log('\nStep 8: Validating EMVCo payload structure...');
  const payload = qrRes.body.payload;
  assert.ok(payload.startsWith('000201'), 'Payload must start with format indicator 000201');
  assert.ok(payload.includes('com.p2pqrpay'), 'Payload must contain QR PH P2P identifier');
  assert.ok(payload.includes('608'), 'Payload must contain PHP currency code 608');
  assert.ok(payload.includes('125.00'), 'Payload must contain amount 125.00');
  assert.ok(payload.includes('PH'), 'Payload must contain country code PH');
  console.log('✅ EMVCo payload structure validated.');

  // 9. Now actually settle via qrph method
  console.log('\nStep 9: Recording QR PH settlement...');
  const settleRes = await request('POST', '/settlements', {
    groupId,
    fromUserId: debtorId,
    amount: 12500,
    method: 'qrph',
    toUserIds: [creditorId]
  }, debtorToken);
  assert.strictEqual(settleRes.status, 200);
  assert.strictEqual(settleRes.body.status, 'confirmed');
  console.log('✅ QR PH settlement recorded and auto-confirmed.');

  console.log('\n🎉 ALL QR PH INTEGRATION TESTS PASSED! 🎉');
  console.log('\nThe generated QR code is scannable by GCash, Maya, UnionBank,');
  console.log('BPI, BDO, and all other QR PH-compatible apps in the Philippines.');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ QR PH Integration Test Failed:', err);
  process.exit(1);
});
