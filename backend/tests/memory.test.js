const http = require('http');

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      hostname: '127.0.0.1',
      port: 5000,
      path,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runMemoryTests() {
  console.log('====================================================');
  console.log('🧠 TESTING HINDSIGHT INTEGRATION ENDPOINTS');
  console.log('====================================================');

  // Login demo user
  const loginRes = await request('POST', '/api/auth/login', {
    email: 'demo.candidate@example.com',
    password: 'Password123!',
  });

  const token = loginRes.body?.token;
  if (!token) {
    console.error('Failed to log in demo candidate for memory tests');
    process.exit(1);
  }

  // 1. Memory Status
  const statusRes = await request('GET', '/api/memory/status', null, token);
  console.log('GET /api/memory/status:', statusRes.status, statusRes.body);

  // 2. Direct Retain
  const retainRes = await request(
    'POST',
    '/api/memory/retain',
    { content: 'User specializes in React 18 and Node.js' },
    token
  );
  console.log('POST /api/memory/retain:', retainRes.status, retainRes.body);

  // 3. Direct Recall
  const recallRes = await request(
    'POST',
    '/api/memory/recall',
    { query: 'React' },
    token
  );
  console.log('POST /api/memory/recall:', recallRes.status, recallRes.body);

  // 4. Direct Reflect
  const reflectRes = await request(
    'POST',
    '/api/memory/reflect',
    { query: 'What are the user goals?' },
    token
  );
  console.log('POST /api/memory/reflect:', reflectRes.status, reflectRes.body);

  console.log('====================================================');
  console.log('Memory tests completed.');
  process.exit(0);
}

require('../server');
setTimeout(runMemoryTests, 3500);
