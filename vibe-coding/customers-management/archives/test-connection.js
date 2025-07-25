import CustomersManagement from './src/index.js';

/**
 * Simple connection test for containerized MongoDB
 */
async function testConnection() {
  console.log('🔧 MongoDB Container Connection Test');
  console.log('=====================================\n');

  const customersManager = new CustomersManagement();
  
  // Common container connection strings
  const testConnections = [
    'mongodb://localhost:27017/customers-management',
    'mongodb://127.0.0.1:27017/customers-management',
    'mongodb://host.docker.internal:27017/customers-management'
  ];

  for (let i = 0; i < testConnections.length; i++) {
    const uri = testConnections[i];
    console.log(`\n🔍 Testing connection ${i + 1}/${testConnections.length}`);
    console.log(`   URI: ${uri}`);
    
    try {
      // Set a timeout for connection
      const connectionPromise = customersManager.initialize(uri);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout (10s)')), 10000)
      );
      
      await Promise.race([connectionPromise, timeoutPromise]);
      
      console.log('   ✅ Connection successful!');
      console.log(`   📊 Database active: ${customersManager.isConnected()}`);
      
      // Test a simple operation
      console.log('   🔧 Testing basic operation...');
      const stats = await customersManager.getCustomerStats();
      
      if (stats.success) {
        console.log(`   ✅ Operations working! Found ${stats.data.total} customers`);
      } else {
        console.log(`   ⚠️  Operations issue: ${stats.error?.message}`);
      }
      
      await customersManager.close();
      console.log('   ✅ Connection closed cleanly');
      
      console.log('\n🎉 SUCCESS! Use this connection string in your main app:');
      console.log(`   ${uri}`);
      return;
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      
      try {
        await customersManager.close();
      } catch (closeError) {
        // Ignore close errors
      }
    }
  }

  console.log('\n❌ All connection attempts failed!');
  console.log('\n🔧 Troubleshooting for Docker containers:');
  console.log('   1. Check if MongoDB container is running:');
  console.log('      docker ps | grep mongo');
  console.log('   2. Check MongoDB container logs:');
  console.log('      docker logs <container-name>');
  console.log('   3. Check port mapping:');
  console.log('      docker port <container-name>');
  console.log('   4. Try connecting from inside container:');
  console.log('      docker exec -it <container-name> mongosh');
  console.log('   5. Check if MongoDB is listening on all interfaces:');
  console.log('      docker exec <container-name> netstat -ln | grep 27017');
}

// Auto-run the test
testConnection().catch(console.error);
