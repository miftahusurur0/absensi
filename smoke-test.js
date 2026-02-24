const http = require('http');

const HOST = process.env.API_HOST || 'localhost';
const PORT = Number(process.env.API_PORT || 3001);

function requestJson(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: HOST,
        port: PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
        }
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => { raw += chunk; });
        res.on('end', () => {
          let parsed;
          try {
            parsed = raw ? JSON.parse(raw) : {};
          } catch (err) {
            return reject(new Error(`${method} ${path} invalid JSON: ${raw}`));
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function assertOk(response, label) {
  if (response.status < 200 || response.status >= 300 || !response.body?.ok) {
    throw new Error(`${label} failed (${response.status}): ${JSON.stringify(response.body)}`);
  }
}

async function run() {
  const testId = `TST${Date.now().toString().slice(-8)}`;
  const testName = `Smoke ${testId}`;

  console.log(`Running smoke test on http://${HOST}:${PORT}`);

  const health = await requestJson('GET', '/api/health');
  assertOk(health, 'Health check');
  console.log('OK  /api/health');

  const dbTest = await requestJson('GET', '/api/db-test');
  assertOk(dbTest, 'DB test');
  console.log('OK  /api/db-test');

  const login = await requestJson('POST', '/api/login', { username: 'admin', password: 'admin' });
  assertOk(login, 'Login');
  console.log('OK  /api/login');

  const createVolunteer = await requestJson('POST', '/api/volunteers', {
    id: testId,
    name: testName,
    role: 'Tester',
    locker: '999',
    qr_code_data: testId,
    card_number: testId,
    status: 'active'
  });
  assertOk(createVolunteer, 'Create volunteer');
  console.log(`OK  create volunteer (${testId})`);

  const getVolunteer = await requestJson('GET', `/api/volunteers/${encodeURIComponent(testId)}`);
  assertOk(getVolunteer, 'Get volunteer');
  console.log('OK  get volunteer by id');

  const createHistory = await requestJson('POST', '/api/history', {
    volunteerId: testId,
    name: testName,
    role: 'Tester',
    locker: '999',
    status: 'Masuk',
    timestamp: new Date().toISOString()
  });
  assertOk(createHistory, 'Create history');
  console.log('OK  create history');

  const historyList = await requestJson('GET', '/api/history');
  assertOk(historyList, 'Get history');
  const found = Array.isArray(historyList.body.data) &&
    historyList.body.data.some((x) => x.volunteer_id === testId || x.volunteerId === testId);
  if (!found) throw new Error('History record not found after insert');
  console.log('OK  verify history contains new record');

  const deleteVolunteer = await requestJson('DELETE', `/api/volunteers/${encodeURIComponent(testId)}`);
  assertOk(deleteVolunteer, 'Delete volunteer');
  console.log('OK  cleanup delete volunteer');

  console.log('\nSmoke test PASSED');
}

run().catch((err) => {
  console.error('\nSmoke test FAILED');
  console.error(err.message);
  process.exit(1);
});
