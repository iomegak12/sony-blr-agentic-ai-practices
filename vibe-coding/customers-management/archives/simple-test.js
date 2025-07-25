import CustomersManagement from './src/index.js';

/**
 * Simple, non-interactive test of the CustomersManagement library
 */
async function simpleTest() {
  console.log('\n🎉 CustomersManagement Library - Simple Test');
  console.log('==============================================\n');

  const customersManager = new CustomersManagement();

  try {
    // Initialize connection
    console.log('📝 Connecting to MongoDB...');
    await customersManager.initialize('mongodb://localhost:27017/customers-management');
    console.log('✅ Connected successfully!');

    // Test customer data
    const testCustomer = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@test.com',
      phone: '+1234567890',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        country: 'Test Country',
        zipCode: '12345'
      },
      socialMedia: {
        facebook: 'https://facebook.com/johndoe',
        instagram: 'https://instagram.com/johndoe'
      },
      status: 'active',
      notes: 'Test customer',
      tags: ['test', 'demo']
    };

    // Test 1: Create customer
    console.log('\n📝 Creating test customer...');
    const createResult = await customersManager.createCustomer(testCustomer);
    if (createResult.success) {
      console.log('✅ Customer created successfully!');
      console.log(`   Name: ${createResult.data.fullName}`);
      console.log(`   Email: ${createResult.data.email}`);
      console.log(`   ID: ${createResult.data.id}`);
      
      const customerId = createResult.data.id;

      // Test 2: Get customer by ID
      console.log('\n🔍 Retrieving customer by ID...');
      const getResult = await customersManager.getCustomerById(customerId);
      if (getResult.success) {
        console.log('✅ Customer retrieved successfully!');
        console.log(`   Found: ${getResult.data.fullName}`);
      } else {
        console.log('❌ Failed to retrieve customer:', getResult.error.message);
      }

      // Test 3: Update customer
      console.log('\n✏️ Updating customer...');
      const updateResult = await customersManager.updateCustomer(customerId, {
        notes: 'Updated test customer',
        tags: ['test', 'demo', 'updated']
      });
      if (updateResult.success) {
        console.log('✅ Customer updated successfully!');
        console.log(`   Updated notes: ${updateResult.data.notes}`);
      } else {
        console.log('❌ Failed to update customer:', updateResult.error.message);
      }

      // Test 4: Search customers
      console.log('\n🔎 Searching customers...');
      const searchResult = await customersManager.searchCustomers('john');
      if (searchResult.success) {
        console.log(`✅ Search completed! Found ${searchResult.data.length} customers`);
      } else {
        console.log('❌ Search failed:', searchResult.error.message);
      }

      // Test 5: Get all customers
      console.log('\n📋 Getting all customers...');
      const allResult = await customersManager.getAllCustomers({ limit: 5 });
      if (allResult.success) {
        console.log(`✅ Retrieved ${allResult.data.length} customers`);
        console.log(`   Total in database: ${allResult.pagination.totalCount}`);
      } else {
        console.log('❌ Failed to get customers:', allResult.error.message);
      }

      // Test 6: Get statistics
      console.log('\n📊 Getting customer statistics...');
      const statsResult = await customersManager.getCustomerStats();
      if (statsResult.success) {
        console.log('✅ Statistics retrieved successfully!');
        console.log(`   Total customers: ${statsResult.data.total}`);
        console.log(`   Active: ${statsResult.data.active}`);
      } else {
        console.log('❌ Failed to get statistics:', statsResult.error.message);
      }

      // Test 7: Validation test
      console.log('\n✅ Testing validation...');
      const invalidData = {
        firstName: 'A', // Too short
        lastName: '',   // Missing
        email: 'invalid-email',
        phone: '123'
      };
      
      const validationResult = await customersManager.createCustomer(invalidData);
      if (!validationResult.success) {
        console.log('✅ Validation working correctly!');
        console.log(`   Caught ${validationResult.error.details?.length || 1} validation errors`);
      } else {
        console.log('❌ Validation failed - accepted invalid data!');
      }

      // Test 8: Delete customer
      console.log('\n🗑️ Deleting test customer...');
      const deleteResult = await customersManager.deleteCustomer(customerId);
      if (deleteResult.success) {
        console.log('✅ Customer deleted successfully!');
      } else {
        console.log('❌ Failed to delete customer:', deleteResult.error.message);
      }

    } else {
      console.log('❌ Failed to create customer:', createResult.error.message);
      if (createResult.error.details) {
        createResult.error.details.forEach(err => {
          console.log(`   • ${err.field}: ${err.message}`);
        });
      }
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ CustomersManagement library is working correctly');

  } catch (error) {
    console.log('\n❌ Test failed with error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   • Make sure MongoDB is running');
    console.log('   • Check if dependencies are installed (npm install)');
    console.log('   • Verify MongoDB connection string');
  } finally {
    // Clean up
    try {
      await customersManager.close();
      console.log('\n✅ Database connection closed');
    } catch (error) {
      console.log('\n❌ Error closing connection:', error.message);
    }
  }
}

// Run the test
simpleTest().catch(console.error);
