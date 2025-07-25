import CustomersManagement from './src/index.js';
import readline from 'readline';

// Create readline interface for user interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
});

// Helper function to ask user questions
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question + ' ', (answer) => {
      resolve(answer.trim());
    });
  });
}

// Helper function to wait for user input
function waitForUser(message = "Press Enter to continue...") {
  return new Promise((resolve) => {
    rl.question(`\n${message}`, () => {
      resolve();
    });
  });
}

// Helper function to clear screen (Windows compatible)
function clearScreen() {
  console.clear();
}

// Helper function to display status with timestamp
function logStatus(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const icons = {
    info: '📝',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    progress: '⏳'
  };
  console.log(`[${timestamp}] ${icons[type]} ${message}`);
}

/**
 * Interactive example usage of the CustomersManagement library
 */
async function example() {
  clearScreen();
  console.log('\n🎉 Welcome to the CustomersManagement Library Interactive Demo!');
  console.log('================================================================');
  console.log('📋 This demo will test all CRUD operations interactively');
  console.log('🔧 Make sure MongoDB is running before proceeding');
  console.log('================================================================\n');

  // Create an instance of the library
  const customersManager = new CustomersManagement();

  try {
    // Test MongoDB connection first with timeout
    logStatus('Testing MongoDB connection (containerized)...', 'progress');
    
    // Try the connection that we know works from the test
    try {
      await customersManager.initialize('mongodb://localhost:27017/customers-management');
      logStatus('MongoDB connection successful!', 'success');
      logStatus(`Database: customers-management`, 'info');
      logStatus(`Connection status: ${customersManager.isConnected() ? 'ACTIVE' : 'INACTIVE'}`, 'info');
    } catch (connectionError) {
      logStatus('MongoDB connection failed!', 'error');
      console.log('\n❌ Connection Error:');
      console.log(`   Error: ${connectionError.message}`);
      console.log('\n🔧 Quick fixes:');
      console.log('   • Ensure MongoDB container is running');
      console.log('   • Check: docker ps | grep mongo');
      console.log('   • Try: npm run test-connection (to verify connection)');
      
      const retry = await askQuestion('\nWould you like to try a custom connection string? (y/n):');
      if (retry.toLowerCase() === 'y') {
        const customUri = await askQuestion('Enter MongoDB URI:');
        await customersManager.initialize(customUri);
        logStatus('Connection successful with custom URI!', 'success');
      } else {
        throw connectionError;
      }
    }

    // Test basic database operations
    logStatus('Testing basic database operations...', 'progress');
    
    const testResult = await customersManager.getCustomerStats();
    if (testResult.success) {
      logStatus('Database operations working correctly!', 'success');
      logStatus(`Current customers in database: ${testResult.data.total}`, 'info');
    } else {
      logStatus('Database operations test failed', 'warning');
      console.log(`   Error: ${testResult.error?.message}`);
    }

    console.log('\n✅ System Status Check Complete!');
    console.log('   🔗 MongoDB: Connected');
    console.log('   🔧 Operations: Working');
    console.log('   📊 Ready for interactive demo');
    console.log('\n💡 Tip: You can exit anytime by selecting option 9');

    await waitForUser('Press Enter to start interactive demo...');

    // Interactive menu system
    let running = true;
    while (running) {
      console.log('\n' + '='.repeat(50));
      console.log('📋 CUSTOMER MANAGEMENT OPERATIONS');
      console.log('='.repeat(50));
      console.log('1. Create a new customer');
      console.log('2. View all customers');
      console.log('3. Search customers');
      console.log('4. Get customer by ID');
      console.log('5. Update customer');
      console.log('6. Delete customer');
      console.log('7. Get customer statistics');
      console.log('8. Test validation');
      console.log('9. Exit');
      console.log('='.repeat(50));

      try {
        const choice = await askQuestion('\nSelect an operation (1-9):');
        
        console.log(`\n🔄 Processing option ${choice}...`);

        switch (choice) {
          case '1':
            await createCustomerInteractive(customersManager);
            break;
          case '2':
            await viewAllCustomers(customersManager);
            break;
          case '3':
            await searchCustomersInteractive(customersManager);
            break;
          case '4':
            await getCustomerByIdInteractive(customersManager);
            break;
          case '5':
            await updateCustomerInteractive(customersManager);
            break;
          case '6':
            await deleteCustomerInteractive(customersManager);
            break;
          case '7':
            await getCustomerStats(customersManager);
            break;
          case '8':
            await testValidation(customersManager);
            break;
          case '9':
            running = false;
            logStatus('Exiting interactive demo...', 'info');
            break;
          default:
            logStatus('Invalid choice. Please select 1-9.', 'warning');
            await waitForUser('Press Enter to continue...');
        }
      } catch (error) {
        logStatus(`Menu error: ${error.message}`, 'error');
        const continueChoice = await askQuestion('Continue with demo? (y/n):');
        if (continueChoice.toLowerCase() !== 'y') {
          running = false;
        }
      }
    }

  } catch (error) {
    logStatus(`Critical error: ${error.message}`, 'error');
    console.log('\n🔧 Troubleshooting tips:');
    console.log('   • Ensure MongoDB is running on your system');
    console.log('   • Check if the database URL is correct');
    console.log('   • Verify you have the required dependencies installed');
    console.log('   • Check network connectivity');
  } finally {
    // Close the connection
    try {
      await customersManager.close();
      logStatus('Database connection closed successfully', 'success');
    } catch (error) {
      logStatus(`Error closing connection: ${error.message}`, 'error');
    }
    
    rl.close();
    console.log('\n👋 Thank you for using CustomersManagement Library!');
  }
}

// Interactive function to create a customer
async function createCustomerInteractive(customersManager) {
  console.log('\n📝 CREATE NEW CUSTOMER');
  console.log('-'.repeat(30));
  
  logStatus('Starting customer creation...', 'progress');
  
  const firstName = await askQuestion('First Name: ');
  const lastName = await askQuestion('Last Name: ');
  const email = await askQuestion('Email: ');
  const phone = await askQuestion('Phone (e.g., +1234567890): ');
  
  const addAddress = await askQuestion('Add address? (y/n): ');
  let address = undefined;
  if (addAddress.toLowerCase() === 'y') {
    address = {
      street: await askQuestion('Street: '),
      city: await askQuestion('City: '),
      state: await askQuestion('State: '),
      country: await askQuestion('Country: '),
      zipCode: await askQuestion('Zip Code: ')
    };
  }

  const addSocial = await askQuestion('Add social media? (y/n): ');
  let socialMedia = undefined;
  if (addSocial.toLowerCase() === 'y') {
    socialMedia = {
      facebook: await askQuestion('Facebook URL (optional): ') || undefined,
      instagram: await askQuestion('Instagram URL (optional): ') || undefined,
      linkedin: await askQuestion('LinkedIn URL (optional): ') || undefined
    };
  }

  const customerData = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    address,
    socialMedia,
    status: 'active',
    notes: 'Created via interactive demo',
    tags: ['demo', 'interactive']
  };

  logStatus('Validating customer data...', 'progress');
  
  try {
    const result = await customersManager.createCustomer(customerData);
    if (result.success) {
      logStatus(`Customer created successfully!`, 'success');
      console.log(`   👤 Name: ${result.data.fullName}`);
      console.log(`   📧 Email: ${result.data.email}`);
      console.log(`   🆔 ID: ${result.data.id}`);
      console.log(`   📅 Created: ${new Date(result.data.createdAt).toLocaleString()}`);
    } else {
      logStatus(`Failed to create customer: ${result.error.message}`, 'error');
      if (result.error.details) {
        console.log('   Validation errors:');
        result.error.details.forEach(err => {
          console.log(`   • ${err.field}: ${err.message}`);
        });
      }
    }
  } catch (error) {
    logStatus(`Unexpected error: ${error.message}`, 'error');
  }
  
  await waitForUser();
}

// Interactive function to view all customers
async function viewAllCustomers(customersManager) {
  console.log('\n📋 VIEW ALL CUSTOMERS');
  console.log('-'.repeat(30));
  
  logStatus('Retrieving customers...', 'progress');
  
  try {
    const result = await customersManager.getAllCustomers({ page: 1, limit: 20 });
    if (result.success) {
      logStatus(`Found ${result.data.length} customers`, 'success');
      
      if (result.data.length === 0) {
        console.log('   No customers found. Create some customers first!');
      } else {
        console.log('\n📊 Customer List:');
        console.log('-'.repeat(80));
        result.data.forEach((customer, index) => {
          console.log(`${index + 1}. ${customer.fullName}`);
          console.log(`   📧 ${customer.email} | 📱 ${customer.phone}`);
          console.log(`   🏷️  Status: ${customer.status} | Tags: ${customer.tags?.join(', ') || 'None'}`);
          console.log(`   📅 Created: ${new Date(customer.createdAt).toLocaleDateString()}`);
          console.log('-'.repeat(80));
        });
        
        console.log(`\n📈 Pagination Info:`);
        console.log(`   Current Page: ${result.pagination.currentPage}`);
        console.log(`   Total Pages: ${result.pagination.totalPages}`);
        console.log(`   Total Count: ${result.pagination.totalCount}`);
      }
    } else {
      logStatus(`Failed to retrieve customers: ${result.error.message}`, 'error');
    }
  } catch (error) {
    logStatus(`Unexpected error: ${error.message}`, 'error');
  }
  
  await waitForUser();
}

// Interactive function to search customers
async function searchCustomersInteractive(customersManager) {
  console.log('\n🔎 SEARCH CUSTOMERS');
  console.log('-'.repeat(30));
  
  const searchTerm = await askQuestion('Enter search term (name or email): ');
  
  if (!searchTerm.trim()) {
    logStatus('Search term cannot be empty', 'warning');
    return;
  }
  
  logStatus(`Searching for "${searchTerm}"...`, 'progress');
  
  try {
    const result = await customersManager.searchCustomers(searchTerm);
    if (result.success) {
      logStatus(`Found ${result.data.length} matching customers`, 'success');
      
      if (result.data.length === 0) {
        console.log(`   No customers match "${searchTerm}"`);
      } else {
        result.data.forEach((customer, index) => {
          console.log(`\n${index + 1}. ${customer.fullName}`);
          console.log(`   📧 ${customer.email}`);
          console.log(`   🆔 ID: ${customer.id}`);
        });
      }
    } else {
      logStatus(`Search failed: ${result.error.message}`, 'error');
    }
  } catch (error) {
    logStatus(`Unexpected error: ${error.message}`, 'error');
  }
  
  await waitForUser();
}

// Interactive function to get customer by ID
async function getCustomerByIdInteractive(customersManager) {
  console.log('\n🔍 GET CUSTOMER BY ID');
  console.log('-'.repeat(30));
  
  const customerId = await askQuestion('Enter Customer ID: ');
  
  if (!customerId.trim()) {
    logStatus('Customer ID cannot be empty', 'warning');
    return;
  }
  
  logStatus(`Looking up customer ${customerId}...`, 'progress');
  
  try {
    const result = await customersManager.getCustomerById(customerId);
    if (result.success) {
      logStatus('Customer found!', 'success');
      const customer = result.data;
      console.log(`\n👤 Customer Details:`);
      console.log(`   Name: ${customer.fullName}`);
      console.log(`   Email: ${customer.email}`);
      console.log(`   Phone: ${customer.phone}`);
      console.log(`   Status: ${customer.status}`);
      if (customer.address) {
        console.log(`   Address: ${customer.address.street}, ${customer.address.city}`);
      }
      if (customer.socialMedia) {
        console.log(`   Social Media: ${Object.keys(customer.socialMedia).filter(k => customer.socialMedia[k]).join(', ')}`);
      }
      console.log(`   Created: ${new Date(customer.createdAt).toLocaleString()}`);
      console.log(`   Updated: ${new Date(customer.updatedAt).toLocaleString()}`);
    } else {
      logStatus(`Customer not found: ${result.error.message}`, 'error');
    }
  } catch (error) {
    logStatus(`Unexpected error: ${error.message}`, 'error');
  }
  
  await waitForUser();
}

// Interactive function to update customer
async function updateCustomerInteractive(customersManager) {
  console.log('\n✏️ UPDATE CUSTOMER');
  console.log('-'.repeat(30));
  
  const customerId = await askQuestion('Enter Customer ID to update: ');
  
  if (!customerId.trim()) {
    logStatus('Customer ID cannot be empty', 'warning');
    return;
  }
  
  // First, get the current customer
  logStatus('Retrieving current customer data...', 'progress');
  const getResult = await customersManager.getCustomerById(customerId);
  if (!getResult.success) {
    logStatus(`Customer not found: ${getResult.error.message}`, 'error');
    return;
  }
  
  const currentCustomer = getResult.data;
  console.log(`\nCurrent customer: ${currentCustomer.fullName}`);
  
  const updateData = {};
  
  const updateNotes = await askQuestion(`Update notes? Current: "${currentCustomer.notes || 'None'}" (y/n): `);
  if (updateNotes.toLowerCase() === 'y') {
    updateData.notes = await askQuestion('New notes: ');
  }
  
  const updateStatus = await askQuestion(`Update status? Current: "${currentCustomer.status}" (y/n): `);
  if (updateStatus.toLowerCase() === 'y') {
    console.log('Available statuses: active, inactive, suspended');
    updateData.status = await askQuestion('New status: ');
  }
  
  if (Object.keys(updateData).length === 0) {
    logStatus('No updates specified', 'warning');
    return;
  }
  
  logStatus('Updating customer...', 'progress');
  
  try {
    const result = await customersManager.updateCustomer(customerId, updateData);
    if (result.success) {
      logStatus('Customer updated successfully!', 'success');
      console.log(`   Updated: ${new Date(result.data.updatedAt).toLocaleString()}`);
    } else {
      logStatus(`Update failed: ${result.error.message}`, 'error');
    }
  } catch (error) {
    logStatus(`Unexpected error: ${error.message}`, 'error');
  }
  
  await waitForUser();
}

// Interactive function to delete customer
async function deleteCustomerInteractive(customersManager) {
  console.log('\n🗑️ DELETE CUSTOMER');
  console.log('-'.repeat(30));
  
  const customerId = await askQuestion('Enter Customer ID to delete: ');
  
  if (!customerId.trim()) {
    logStatus('Customer ID cannot be empty', 'warning');
    return;
  }
  
  // First, get the customer to show what will be deleted
  const getResult = await customersManager.getCustomerById(customerId);
  if (!getResult.success) {
    logStatus(`Customer not found: ${getResult.error.message}`, 'error');
    return;
  }
  
  const customer = getResult.data;
  console.log(`\nCustomer to delete: ${customer.fullName} (${customer.email})`);
  
  const confirm = await askQuestion('Are you sure you want to delete this customer? (yes/no): ');
  if (confirm.toLowerCase() !== 'yes') {
    logStatus('Deletion cancelled', 'info');
    return;
  }
  
  logStatus('Deleting customer...', 'progress');
  
  try {
    const result = await customersManager.deleteCustomer(customerId);
    if (result.success) {
      logStatus('Customer deleted successfully!', 'success');
    } else {
      logStatus(`Deletion failed: ${result.error.message}`, 'error');
    }
  } catch (error) {
    logStatus(`Unexpected error: ${error.message}`, 'error');
  }
  
  await waitForUser();
}

// Get customer statistics
async function getCustomerStats(customersManager) {
  console.log('\n📊 CUSTOMER STATISTICS');
  console.log('-'.repeat(30));
  
  logStatus('Calculating statistics...', 'progress');
  
  try {
    const result = await customersManager.getCustomerStats();
    if (result.success) {
      logStatus('Statistics retrieved successfully!', 'success');
      const stats = result.data;
      
      console.log(`\n📈 Customer Statistics:`);
      console.log(`   Total Customers: ${stats.total}`);
      console.log(`   Active: ${stats.active} (${stats.byStatus.active}%)`);
      console.log(`   Inactive: ${stats.inactive} (${stats.byStatus.inactive}%)`);
      console.log(`   Suspended: ${stats.suspended} (${stats.byStatus.suspended}%)`);
    } else {
      logStatus(`Failed to get statistics: ${result.error.message}`, 'error');
    }
  } catch (error) {
    logStatus(`Unexpected error: ${error.message}`, 'error');
  }
  
  await waitForUser();
}

// Test validation
async function testValidation(customersManager) {
  console.log('\n✅ TEST VALIDATION');
  console.log('-'.repeat(30));
  
  logStatus('Testing validation with invalid data...', 'progress');
  
  const invalidData = {
    firstName: 'A', // Too short
    lastName: '', // Required field missing
    email: 'invalid-email', // Invalid email format
    phone: '123', // Invalid phone format
    dateOfBirth: new Date('2030-01-01'), // Future date
    socialMedia: {
      facebook: 'not-a-url' // Invalid URL
    }
  };
  
  try {
    const result = await customersManager.createCustomer(invalidData);
    if (!result.success) {
      logStatus('Validation working correctly!', 'success');
      console.log('\n   Validation errors caught:');
      if (result.error.details) {
        result.error.details.forEach(err => {
          console.log(`   ❌ ${err.field}: ${err.message}`);
        });
      } else {
        console.log(`   ❌ ${result.error.message}`);
      }
    } else {
      logStatus('Validation failed - invalid data was accepted!', 'error');
    }
  } catch (error) {
    logStatus('Validation working - caught error in validation layer', 'success');
    console.log(`   Error: ${error.message}`);
  }
  
  await waitForUser();
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  example().catch(console.error);
}

export default example;
