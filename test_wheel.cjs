const https = require('https');
const deviceId = 'test_device_' + Date.now();
const idempotencyKey1 = 'idem_' + Date.now();
const idempotencyKey2 = 'idem2_' + Date.now();

const postData1 = JSON.stringify({ deviceId, idempotencyKey: idempotencyKey1 });
const req1 = https.request({
  hostname: 'eft-pro.grg0.workers.dev',
  path: '/api/wheel/spin',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData1) }
}, (res1) => {
  let data1 = '';
  res1.on('data', chunk => data1 += chunk);
  res1.on('end', () => {
    console.log("SPIN 1 RES:", res1.statusCode, data1);
    
    // Spin 2 immediately
    const postData2 = JSON.stringify({ deviceId, idempotencyKey: idempotencyKey2 });
    const req2 = https.request({
      hostname: 'eft-pro.grg0.workers.dev',
      path: '/api/wheel/spin',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData2) }
    }, (res2) => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
        console.log("SPIN 2 RES:", res2.statusCode, data2);
      });
    });
    req2.write(postData2);
    req2.end();
  });
});
req1.write(postData1);
req1.end();
