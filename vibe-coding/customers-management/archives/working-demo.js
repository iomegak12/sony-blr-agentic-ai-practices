import CustomersManagement from './src/index.js';
import { createInterface } from 'readline';

// Create a better readline interface
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function with proper Windows console handling
function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Helper function to display status
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const icons = { info: '📝', success: '✅', error: '❌', warning: '⚠️', progress: '⏳' };
  console.log(`[${timestamp}] ${icons[type]} ${message}`);
}

/**
 * Working interactive demo
 */
async function workingDemo() {
  console.log('\n🎉 CustomersManagement Interactive Demo (Working Version)');
  console.log('=======================================================\n');

  const customersManager = new CustomersManagement();

  try {
    // Connect to database
    log('Connecting to MongoDB...', 'progress');
    await customersManager.initialize('mongodb://localhost:27017/customers-management');
    log('Connected successfully!', 'success');

    // Get initial stats
    const stats = await customersManager.getCustomerStats();
    log(`Current customers in database: ${stats.data.total}`, 'info');

    // Interactive loop
    let running = true;
    while (running) {
      console.log('\n' + '='.repeat(40));
      console.log('CUSTOMER OPERATIONS MENU');
      console.log('='.repeat(40));
      console.log('1. Create customer');
      console.log('2. View all customers');
      console.log('3. Search customers');
      console.log('4. Get customer statistics');
      console.log('5. Run all tests');
      console.log('9. Exit');
      console.log('='.repeat(40));

      const choice = await ask('\nEnter your choice (1-5, 9): ');
      console.log(''); // Add spacing

      switch (choice) {
        case '1':
          await createCustomer(customersManager);
          break;
        case '2':
          await viewCustomers(customersManager);
          break;
        case '3':
          await searchCustomers(customersManager);
          break;
        case '4':
          await showStats(customersManager);
          break;
        case '5':
          await runAllTests(customersManager);
          break;
        case '9':
          log('Exiting demo...', 'info');
          running = false;
          break;
        default:
          log('Invalid choice. Please try again.', 'warning');
      }

      if (running) {
        await ask('Press Enter to continue...');
      }
    }

  } catch (error) {
    log(`Error: ${error.message}`, 'error');
  } finally {
    try {
      await customersManager.close();
      log('Database connection closed', 'success');
    } catch (error) {
      log(`Error closing connection: ${error.message}`, 'error');
    }
    rl.close();
    console.log('\n👋 Thank you for using CustomersManagement!');
  }
}

// Create a customer
async function createCustomer(manager) {
  console.log('📝 CREATE CUSTOMER');
  console.log('-'.repeat(20));

  const firstName = await ask('First Name: ');
  const lastName = await ask('Last Name: ');
  const email = await ask('Email: ');
  const phone = await ask('Phone (+1234567890): ');

  const customerData = {
    firstName,
    lastName,
    email,
    phone,
    status: 'active',
    notes: 'Created via interactive demo',
    tags: ['demo']
  };

  log('Creating customer...', 'progress');
  const result = await manager.createCustomer(customerData);

  if (result.success) {
    log('Customer created successfully!', 'success');
    console.log(`   Name: ${result.data.fullName}`);
    console.log(`   Email: ${result.data.email}`);
    console.log(`   ID: ${result.data.id}`);
  } else {
    log(`Failed: ${result.error.message}`, 'error');
    if (result.error.details) {
      result.error.details.forEach(err => {
        console.log(`   • ${err.field}: ${err.message}`);
      });
    }
  }
}

// View all customers
async function viewCustomers(manager) {
  console.log('📋 ALL CUSTOMERS');
  console.log('-'.repeat(20));

  log('Retrieving customers...', 'progress');
  const result = await manager.getAllCustomers({ limit: 10 });

  if (result.success) {
    log(`Found ${result.data.length} customers`, 'success');
    
    if (result.data.length === 0) {
      console.log('   No customers found. Create some first!');
    } else {
      console.log('\nCustomer List:');
      result.data.forEach((customer, index) => {
        console.log(`${index + 1}. ${customer.fullName}`);
        console.log(`   📧 ${customer.email}`);
        console.log(`   📱 ${customer.phone}`);
        console.log(`   🏷️  ${customer.status} | Tags: ${customer.tags?.join(', ') || 'None'}`);
        console.log('   ' + '-'.repeat(50));
      });
    }
  } else {
    log(`Failed: ${result.error.message}`, 'error');
  }
}

// Search customers
async function searchCustomers(manager) {
  console.log('🔎 SEARCH CUSTOMERS');
  console.log('-'.repeat(20));

  const searchTerm = await ask('Enter search term (name or email): ');
  
  if (!searchTerm) {
    log('Search term cannot be empty', 'warning');
    return;
  }

  log(`Searching for "${searchTerm}"...`, 'progress');
  const result = await manager.searchCustomers(searchTerm);

  if (result.success) {
    log(`Found ${result.data.length} matching customers`, 'success');
    
    if (result.data.length === 0) {
      console.log(`   No customers match "${searchTerm}"`);
    } else {
      result.data.forEach((customer, index) => {
        console.log(`${index + 1}. ${customer.fullName} (${customer.email})`);
      });
    }
  } else {
    log(`Search failed: ${result.error.message}`, 'error');
  }
}

// Show statistics  
async function showStats(manager) {
  console.log('📊 CUSTOMER STATISTICS');
  console.log('-'.repeat(20));

  log('Calculating statistics...', 'progress');
  const result = await manager.getCustomerStats();

  if (result.success) {
    log('Statistics retrieved!', 'success');
    const stats = result.data;
    
    console.log(`\nCustomer Statistics:`);
    console.log(`   Total: ${stats.total}`);
    console.log(`   Active: ${stats.active} (${stats.byStatus.active}%)`);
    console.log(`   Inactive: ${stats.inactive} (${stats.byStatus.inactive}%)`);
    console.log(`   Suspended: ${stats.suspended} (${stats.byStatus.suspended}%)`);
  } else {
    log(`Failed: ${result.error.message}`, 'error');
  }
}

// Run comprehensive tests
async function runAllTests(manager) {
  console.log('🧪 RUNNING ALL TESTS');
  console.log('-'.repeat(20));

  const testData = {
    firstName: 'Test',
    lastName: 'User',
    email: `test${Date.now()}@example.com`,
    phone: '+1234567890',
    address: { city: 'Test City', country: 'Test Country' },
    socialMedia: { facebook: 'https://facebook.com/testuser' },
    status: 'active',
    notes: 'Automated test customer',
    tags: ['test', 'automated']
  };

  let testsPassed = 0;
  let testsTotal = 7;

  // Test 1: Create
  log('Test 1: Creating customer...', 'progress');
  const createResult = await manager.createCustomer(testData);
  if (createResult.success) {
    log('✓ Create test passed', 'success');
    testsPassed++;
    
    const customerId = createResult.data.id;

    // Test 2: Get by ID
    log('Test 2: Getting customer by ID...', 'progress');
    const getResult = await manager.getCustomerById(customerId);
    if (getResult.success) {
      log('✓ Get by ID test passed', 'success');
      testsPassed++;
    } else {
      log('✗ Get by ID test failed', 'error');
    }

    // Test 3: Update
    log('Test 3: Updating customer...', 'progress');
    const updateResult = await manager.updateCustomer(customerId, { notes: 'Updated test' });
    if (updateResult.success) {
      log('✓ Update test passed', 'success');
      testsPassed++;
    } else {
      log('✗ Update test failed', 'error');
    }

    // Test 4: Search
    log('Test 4: Searching customers...', 'progress');
    const searchResult = await manager.searchCustomers('Test');
    if (searchResult.success && searchResult.data.length > 0) {
      log('✓ Search test passed', 'success');
      testsPassed++;
    } else {
      log('✗ Search test failed', 'error');
    }

    // Test 5: Get all
    log('Test 5: Getting all customers...', 'progress');
    const allResult = await manager.getAllCustomers();
    if (allResult.success) {
      log('✓ Get all test passed', 'success');
      testsPassed++;
    } else {
      log('✗ Get all test failed', 'error');
    }

    // Test 6: Statistics
    log('Test 6: Getting statistics...', 'progress');
    const statsResult = await manager.getCustomerStats();
    if (statsResult.success) {
      log('✓ Statistics test passed', 'success');
      testsPassed++;
    } else {
      log('✗ Statistics test failed', 'error');
    }

    // Test 7: Delete
    log('Test 7: Deleting customer...', 'progress');
    const deleteResult = await manager.deleteCustomer(customerId);
    if (deleteResult.success) {
      log('✓ Delete test passed', 'success');
      testsPassed++;
    } else {
      log('✗ Delete test failed', 'error');
    }

  } else {
    log('✗ Create test failed - cannot continue', 'error');
  }

  console.log(`\n🎯 Test Results: ${testsPassed}/${testsTotal} tests passed`);
  if (testsPassed === testsTotal) {
    log('All tests passed! 🎉', 'success');
  } else {
    log(`${testsTotal - testsPassed} tests failed`, 'warning');
  }
}

// Start the demo
workingDemo().catch(console.error);
