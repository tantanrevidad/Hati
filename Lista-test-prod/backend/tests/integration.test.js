const assert = require('assert');
const http = require('http');

const PORT = process.env.PORT || 3000;

// Helper to make HTTP requests in tests
function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json',
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
            const parsed = responseBody ? JSON.parse(responseBody) : {};
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            reject(new Error(`Failed to parse response: ${responseBody}`));
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (body && method !== 'GET' && method !== 'DELETE') {
      req.write(data);
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING INTEGRATION TESTS ---');
  
  try {
    // 1. Health check
    const health = await request('GET', '/health');
    assert.strictEqual(health.status, 200);
    assert.strictEqual(health.body.status, 'healthy');
    console.log('✅ Health check passed');

    // 2. Authentication & Login
    const loginHost = await request('POST', '/auth/login', {
      method: 'phone',
      credential: '+639171234567',
      displayName: 'Tedd Host'
    });
    assert.strictEqual(loginHost.status, 200);
    assert.ok(loginHost.body.token);
    assert.strictEqual(loginHost.body.user.displayName, 'Tedd Host');
    const hostToken = loginHost.body.token;
    const hostId = loginHost.body.user.id;
    console.log('✅ Host login passed');

    const loginRenterA = await request('POST', '/auth/login', {
      method: 'email',
      credential: 'mark@example.com',
      displayName: 'Mark Roommate'
    });
    assert.strictEqual(loginRenterA.status, 200);
    const renterAToken = loginRenterA.body.token;
    const renterAId = loginRenterA.body.user.id;
    console.log('✅ Renter A login passed');

    const loginRenterB = await request('POST', '/auth/login', {
      method: 'google',
      credential: 'sophia_google_id_123',
      displayName: 'Sophia Roommate'
    });
    assert.strictEqual(loginRenterB.status, 200);
    const renterBToken = loginRenterB.body.token;
    const renterBId = loginRenterB.body.user.id;
    console.log('✅ Renter B login passed');

    // 3. User payment onboarding linking
    const linkPM = await request('POST', '/users/me/payment-methods', {
      type: 'gcash',
      referenceToken: 'ref_gcash_12345'
    }, renterAToken);
    assert.strictEqual(linkPM.status, 200);
    assert.strictEqual(linkPM.body.linkedPaymentMethods.length, 1);
    assert.strictEqual(linkPM.body.linkedPaymentMethods[0].type, 'gcash');
    console.log('✅ Onboarding wallet linking passed');

    // 4. Create Group
    const newGroup = await request('POST', '/groups', {
      name: 'Dorm 404'
    }, hostToken);
    assert.strictEqual(newGroup.status, 200);
    assert.strictEqual(newGroup.body.name, 'Dorm 404');
    assert.strictEqual(newGroup.body.hostId, hostId);
    const groupId = newGroup.body.id;
    console.log('✅ Group creation passed');

    // 5. Generate Join Link
    const joinLink = await request('POST', `/groups/${groupId}/join-link`, {}, hostToken);
    assert.strictEqual(joinLink.status, 200);
    assert.ok(joinLink.body.slug);
    const slug = joinLink.body.slug;
    console.log('✅ Join link generation passed');

    // 6. Join Group via Slug
    const joinA = await request('GET', `/join/${slug}`, {}, renterAToken);
    assert.strictEqual(joinA.status, 200);
    assert.strictEqual(joinA.body.group.id, groupId);
    
    const joinB = await request('GET', `/join/${slug}`, {}, renterBToken);
    assert.strictEqual(joinB.status, 200);
    console.log('✅ Group joining passed');

    // 7. Post Expense 1: Electricity ₱3,000 split equally between Tedd, Mark, Sophia (1,000 each)
    const exp1 = await request('POST', `/groups/${groupId}/expenses`, {
      description: 'Electricity Bill',
      amount: 300000, // ₱3,000.00
      category: 'utilities',
      paidBy: hostId,
      splitType: 'equal'
    }, hostToken);
    assert.strictEqual(exp1.status, 200);
    console.log('✅ Expense 1 logged');

    // 8. Post Expense 2: Groceries ₱1,500 split equally between Tedd and Mark (750 each)
    const exp2 = await request('POST', `/groups/${groupId}/expenses`, {
      description: 'Groceries split with @Tedd',
      amount: 150000, // ₱1,500.00
      category: 'groceries',
      paidBy: renterAId,
      splitType: 'equal',
      splitDetails: {
        participantIds: [hostId, renterAId]
      }
    }, renterAToken);
    assert.strictEqual(exp2.status, 200);
    console.log('✅ Expense 2 logged');

    // 9. Query Ledger
    // Balances expected:
    // Tedd (paid 3000, owed 1000 [electricity] + 750 [groceries] = 1750) -> net balance = +1250 (125000)
    // Mark (paid 1500, owed 1000 [electricity] + 750 [groceries] = 1750) -> net balance = -250 (-25000)
    // Sophia (paid 0, owed 1000 [electricity]) -> net balance = -1000 (-100000)
    const ledger = await request('GET', `/groups/${groupId}/ledger`, {}, hostToken);
    assert.strictEqual(ledger.status, 200);
    assert.strictEqual(ledger.body.balances[hostId], 125000);
    assert.strictEqual(ledger.body.balances[renterAId], -25000);
    assert.strictEqual(ledger.body.balances[renterBId], -100000);

    // Debts expected (simplified):
    // Mark owes Tedd ₱250 (25000)
    // Sophia owes Tedd ₱1000 (100000)
    assert.strictEqual(ledger.body.debts.length, 2);
    const d1 = ledger.body.debts.find(d => d.fromUserId === renterAId);
    const d2 = ledger.body.debts.find(d => d.fromUserId === renterBId);
    assert.strictEqual(d1.toUserId, hostId);
    assert.strictEqual(d1.amount, 25000);
    assert.strictEqual(d2.toUserId, hostId);
    assert.strictEqual(d2.amount, 100000);
    console.log('✅ Ledger calculations and debt simplification passed');

    // 10. Nudge roommate
    const nudge = await request('POST', `/groups/${groupId}/nudge`, {
      toUserId: renterBId
    }, hostToken);
    assert.strictEqual(nudge.status, 200);
    assert.strictEqual(nudge.body.fromUserId, hostId);
    assert.strictEqual(nudge.body.toUserId, renterBId);

    // Test nudge rate limit (should fail with 429)
    const nudgeFail = await request('POST', `/groups/${groupId}/nudge`, {
      toUserId: renterBId
    }, hostToken);
    assert.strictEqual(nudgeFail.status, 429);
    console.log('✅ Nudge rate limiting passed');

    // 11. Settle debts - Cash path (Sophia owes Tedd 1000)
    const cashSettle = await request('POST', '/settlements', {
      groupId,
      fromUserId: renterBId,
      amount: 100000,
      method: 'cash',
      toUserIds: [hostId]
    }, renterBToken);
    assert.strictEqual(cashSettle.status, 200);
    assert.strictEqual(cashSettle.body.status, 'awaiting_confirmation');
    const cashSettleId = cashSettle.body.id;

    // Host confirms Cash payment
    const cashConfirm = await request('POST', `/settlements/${cashSettleId}/confirm`, {}, hostToken);
    assert.strictEqual(cashConfirm.status, 200);
    assert.strictEqual(cashConfirm.body.status, 'confirmed');

    // Verify ledger balance for Sophia is now 0
    const postCashLedger = await request('GET', `/groups/${groupId}/ledger`, {}, hostToken);
    assert.strictEqual(postCashLedger.body.balances[renterBId], 0);
    console.log('✅ Cash settlement & confirmation flow passed');

    // 12. Settle debts - Stellar path (Mark owes Tedd 250)
    // NOTE: This will perform actual Friendbot account generation and testnet submissions
    console.log('Running testnet Stellar payment transaction... This may take up to 20 seconds...');
    const stellarSettle = await request('POST', '/settlements', {
      groupId,
      fromUserId: renterAId,
      amount: 25000,
      method: 'stellar',
      toUserIds: [hostId]
    }, renterAToken);

    assert.strictEqual(stellarSettle.status, 200);
    assert.strictEqual(stellarSettle.body.status, 'confirmed');
    assert.ok(stellarSettle.body.stellarTxHash);
    console.log('Stellar transaction hash:', stellarSettle.body.stellarTxHash);

    // Verify ledger balance for Mark is now 0
    const finalLedger = await request('GET', `/groups/${groupId}/ledger`, {}, hostToken);
    assert.strictEqual(finalLedger.body.balances[renterAId], 0);
    console.log('✅ Stellar on-chain fee-bumped settlement passed');

    console.log('\n⭐ ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ⭐');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ INTEGRATION TEST FAILED:');
    console.error(err);
    process.exit(1);
  }
}

// Check if npm install completed before running tests
// We can execute runTests directly when this script is run
runTests();
