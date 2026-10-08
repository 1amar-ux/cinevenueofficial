const https = require('https');

function get(path) {
  return new Promise((resolve) => {
    https.get({
      hostname: 'www.cinevenue.com',
      port: 443,
      path: path,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data: data.substring(0, 1000) }));
    }).on('error', (e) => resolve({ error: e.message }));
  });
}

async function run() {
  console.log("1. /api/v1/events:");
  const r1 = await get('/api/v1/events');
  console.log(r1.status, r1.data);

  console.log("\n2. /api/events:");
  const r2 = await get('/api/events');
  console.log(r2.status, r2.data);

  console.log("\n3. /api/v1/admin/events:");
  const r3 = await get('/api/v1/admin/events');
  console.log(r3.status, r3.data);
}

run();
