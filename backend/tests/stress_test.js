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
  console.log('🔥 STARTING BACKEND & DB STRESS TESTS 🔥\n');

  // Step 1: Create 100 concurrent login/signups
  console.log('Sending 100 concurrent authentication requests...');
  const authPromises = [];
  for (let i = 0; i < 100; i++) {
    authPromises.push(
      request('POST', '/auth/login', {
        method: 'email',
        credential: `user_${i}@stress.com`,
        displayName: `StressUser_${i}`,
      })
    );
  }
  const authResults = await Promise.all(authPromises);
  const users = authResults.map(r => r.body.user);
  const tokens = authResults.map(r => r.body.token);

  assert.strictEqual(authResults.length, 100);
  authResults.forEach(r => assert.strictEqual(r.status, 200));
  console.log('✅ 100 concurrent user registrations successfully completed and saved in DB.');

  // Step 2: Concurrently create 20 groups
  console.log('\nCreating 20 concurrent groups...');
  const groupPromises = [];
  for (let i = 0; i < 20; i++) {
    groupPromises.push(
      request('POST', '/groups', { name: `Stress Group ${i}` }, tokens[i])
    );
  }
  const groupResults = await Promise.all(groupPromises);
  const groupIds = groupResults.map(r => r.body.id);
  groupResults.forEach(r => assert.strictEqual(r.status, 200));
  console.log('✅ 20 concurrent groups created in database.');

  // Step 3: Concurrently join users to groups
  console.log('\nGenerating join links and joining 3 members to each group concurrently...');
  const joinPromises = [];
  for (let i = 0; i < 20; i++) {
    const groupId = groupIds[i];
    const hostToken = tokens[i];
    joinPromises.push(
      (async () => {
        const linkRes = await request('POST', `/groups/${groupId}/join-link`, {}, hostToken);
        assert.strictEqual(linkRes.status, 200);
        const slug = linkRes.body.slug;

        // Have 3 other users join
        const join1 = await request('GET', `/join/${slug}`, {}, tokens[i + 1]);
        const join2 = await request('GET', `/join/${slug}`, {}, tokens[i + 2]);
        const join3 = await request('GET', `/join/${slug}`, {}, tokens[i + 3]);
        
        assert.strictEqual(join1.status, 200);
        assert.strictEqual(join2.status, 200);
        assert.strictEqual(join3.status, 200);
      })()
    );
  }
  await Promise.all(joinPromises);
  console.log('✅ 60 concurrent user joins processed and ledger updated successfully.');

  // Step 4: Post 100 concurrent expenses with random splits
  console.log('\nPosting 100 concurrent expenses with split configurations...');
  const expensePromises = [];
  for (let i = 0; i < 100; i++) {
    const groupIndex = i % 20;
    const groupId = groupIds[groupIndex];
    const userIndex = groupIndex;
    const token = tokens[userIndex];
    const member1 = users[userIndex + 1].id;
    const member2 = users[userIndex + 2].id;

    expensePromises.push(
      request('POST', `/groups/${groupId}/expenses`, {
        description: `Stress expense ${i} @StressUser_${userIndex + 1}`,
        amount: Math.floor(Math.random() * 5000) + 500, // ₱5.00 - ₱55.00
        category: 'groceries',
        paidBy: users[userIndex].id,
        splitType: 'equal',
        splitDetails: {
          participantIds: [users[userIndex].id, member1, member2]
        }
      }, token)
    );
  }
  const expenseResults = await Promise.all(expensePromises);
  expenseResults.forEach(r => assert.strictEqual(r.status, 200));
  console.log('✅ 100 concurrent expenses computed and stored.');

  // Step 5: Settle debts concurrently (Cash approvals)
  console.log('\nCreating 20 concurrent Cash settlements...');
  const settlePromises = [];
  for (let i = 0; i < 20; i++) {
    const groupId = groupIds[i];
    const debtorToken = tokens[i + 1];
    const debtorId = users[i + 1].id;
    const creditorId = users[i].id;

    settlePromises.push(
      (async () => {
        const settleRes = await request('POST', '/settlements', {
          groupId,
          fromUserId: debtorId,
          amount: 100, // ₱1.00
          method: 'cash',
          toUserIds: [creditorId]
        }, debtorToken);
        assert.strictEqual(settleRes.status, 200);
        const settlementId = settleRes.body.id;

        // Creditor confirms receipt
        const confirmRes = await request('POST', `/settlements/${settlementId}/confirm`, {
          confirmedBy: creditorId
        }, tokens[i]);
        assert.strictEqual(confirmRes.status, 200);
        assert.strictEqual(confirmRes.body.status, 'confirmed');
      })()
    );
  }
  await Promise.all(settlePromises);
  console.log('✅ 20 concurrent Cash settlements and confirmations resolved.');

  // Step 6: Live Stellar Concurrency (Settle 3 concurrent transactions on Testnet)
  console.log('\nRunning 3 concurrent live Stellar settlements on Testnet...');
  console.log('This submits real transaction batches to the testnet, please wait...');
  const stellarPromises = [];
  for (let i = 0; i < 3; i++) {
    const groupId = groupIds[i];
    const debtorToken = tokens[i + 1];
    const debtorId = users[i + 1].id;
    const creditorId = users[i].id;

    stellarPromises.push(
      (async () => {
        const setupDebtor = await request('POST', '/settlements', {
          groupId,
          fromUserId: debtorId,
          amount: 50, // ₱0.50
          method: 'stellar',
          toUserIds: [creditorId]
        }, debtorToken);
        return setupDebtor;
      })()
    );
  }
  const stellarResults = await Promise.all(stellarPromises);
  stellarResults.forEach(r => {
    console.log(`Stellar settlement status: ${r.status}, Hash: ${r.body.stellarTxHash || 'none'}`);
    assert.strictEqual(r.status, 200);
    assert.ok(r.body.stellarTxHash);
  });
  console.log('✅ 3 concurrent live fee-bumped Stellar transactions succeeded on Testnet.');

  console.log('\n🔥 ALL STRESS TESTS COMPLETED SUCCESSFULLY! 🔥');
  process.exit(0);
}

run().catch(e => {
  console.error('❌ Stress test failed:', e);
  process.exit(1);
});
