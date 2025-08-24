const http = require('http');

const testEndpoints = [
  { method: 'GET', path: '/health', description: 'Health Check' },
  { method: 'GET', path: '/api/test/ping', description: 'Test Ping' },
  { method: 'GET', path: '/api/addresses', description: 'Get Addresses' },
  { method: 'GET', path: '/api/products', description: 'Get Products' },
  { method: 'GET', path: '/api/categories', description: 'Get Categories' }
];

const testEndpoint = (method, path, description) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          description,
          status: res.statusCode,
          success: res.statusCode < 400,
          path: path
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        description,
        status: 'ERROR',
        success: false,
        error: error.message,
        path: path
      });
    });

    req.end();
  });
};

const runTests = async () => {
  console.log('🧪 Testing server endpoints...\n');
  
  for (const endpoint of testEndpoints) {
    const result = await testEndpoint(endpoint.method, endpoint.path, endpoint.description);
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.description}: ${result.status} - ${result.path}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }
  
  console.log('\n🏁 Test completed!');
};

// Wait a bit for server to start, then run tests
setTimeout(runTests, 2000);