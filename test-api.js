const http = require('http');

// Test POST history with valid volunteer
const postData = JSON.stringify({
  volunteerId: 'STA0180',
  name: 'Budi Santoso',
  role: 'Staff',
  locker: '18',
  status: 'Masuk',
  timestamp: new Date().toISOString()
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/history',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('POST /api/history Response:', data);
    console.log('\n---\n');
    
    // Then get history
    setTimeout(getHistory, 500);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(postData);
req.end();

function getHistory() {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/history',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('GET /api/history Response:');
      console.log(data);
    });
  });
  req.end();
}
