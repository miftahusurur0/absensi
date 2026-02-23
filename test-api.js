const http = require('http');

// Test GET volunteers
const getVolunteers = () => {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/volunteers',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('GET /api/volunteers:');
      console.log(data);
      console.log('\n---\n');
      
      // Test GET history
      testHistory();
    });
  });
  req.end();
};

const testHistory = () => {
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
      console.log('GET /api/history:');
      console.log(data);
    });
  });
  req.end();
};

getVolunteers();
