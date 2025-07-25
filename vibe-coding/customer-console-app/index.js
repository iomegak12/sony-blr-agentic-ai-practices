import readlineSync from 'readline-sync';
import { CustomersManagement } from '../customers-management/src/index.js';

class CustomerConsoleApp {
  constructor() {
    this.customersManager = new CustomersManagement();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      console.log('🔄 Initializing Customer Management System...');
      await this.customersManager.initialize();
      this.isInitialized = true;
      console.log('✅ System initialized successfully!\n');
    } catch (error) {
      console.error('❌ Failed to initialize system:', error.message);
      process.exit(1);
    }
  }

  displayMenu() {
    console.log('═══════════════════════════════════════');
    console.log('    📋 CUSTOMER MANAGEMENT SYSTEM');
    console.log('═══════════════════════════════════════');
    console.log('1. 👤 Create New Customer');
    console.log('2. 📋 List All Customers');
    console.log('3. 🔍 Search Customer by ID');
    console.log('4. ✏️  Update Customer');
    console.log('5. 🗑️  Delete Customer');
    console.log('6. 🔎 Search Customers');
    console.log('7. 📊 View Statistics');
    console.log('8. 🚪 Exit');
    console.log('═══════════════════════════════════════');
  }

  async createCustomer() {
    console.log('\n📝 Creating New Customer');
    console.log('────────────────────────');
    
    try {
      // Get required fields only
      const firstName = readlineSync.question('First Name: ');
      const lastName = readlineSync.question('Last Name: ');
      const email = readlineSync.question('Email: ');
      const phone = readlineSync.question('Phone: ');

      const customerData = {
        firstName,
        lastName,
        email,
        phone
      };

      const result = await this.customersManager.createCustomer(customerData);
      
      if (!result.success) {
        console.error('❌ Error creating customer:', result.message);
        return;
      }

      const customer = result.data;
      console.log('✅ Customer created successfully!');
      console.log(`📋 Customer ID: ${customer._id}`);
      console.log(`👤 Name: ${customer.firstName} ${customer.lastName}`);
      console.log(`📧 Email: ${customer.email}\n`);
    } catch (error) {
      console.error('❌ Error creating customer:', error.message);
    }
  }

  async listAllCustomers() {
    console.log('\n📋 All Customers');
    console.log('────────────────');
    
    try {
      const result = await this.customersManager.getAllCustomers();
      
      // Check if the result has the expected structure
      if (!result.success) {
        console.error('❌ Error fetching customers:', result.message);
        return;
      }

      const customers = result.data;
      
      if (!customers || customers.length === 0) {
        console.log('📭 No customers found.\n');
        return;
      }

      customers.forEach((customer, index) => {
        console.log(`${index + 1}. ${customer.firstName} ${customer.lastName}`);
        console.log(`   📧 ${customer.email}`);
        console.log(`   📞 ${customer.phone}`);
        console.log(`   🆔 ID: ${customer._id}`);
        console.log(`   📅 Created: ${new Date(customer.createdAt).toLocaleDateString()}`);
        console.log('   ─────────────────────────');
      });
      console.log(`📊 Total customers: ${customers.length}\n`);
    } catch (error) {
      console.error('❌ Error fetching customers:', error.message);
    }
  }

  async searchCustomerById() {
    console.log('\n🔍 Search Customer by ID');
    console.log('───────────────────────');
    
    try {
      const customerId = readlineSync.question('Enter Customer ID: ');
      const result = await this.customersManager.getCustomerById(customerId);
      
      if (!result.success) {
        console.log('❌ Customer not found.\n');
        return;
      }

      const customer = result.data;
      this.displayCustomerDetails(customer);
    } catch (error) {
      console.error('❌ Error searching customer:', error.message);
    }
  }

  async updateCustomer() {
    console.log('\n✏️ Update Customer');
    console.log('─────────────────');
    
    try {
      const customerId = readlineSync.question('Enter Customer ID to update: ');
      
      // First, get the current customer
      const getResult = await this.customersManager.getCustomerById(customerId);
      if (!getResult.success) {
        console.log('❌ Customer not found.\n');
        return;
      }

      const existingCustomer = getResult.data;
      console.log('\n📋 Current Details:');
      this.displayCustomerDetails(existingCustomer);

      console.log('\n📝 Enter new values (press Enter to keep current value):');
      
      const firstName = readlineSync.question(`First Name [${existingCustomer.firstName}]: `) || existingCustomer.firstName;
      const lastName = readlineSync.question(`Last Name [${existingCustomer.lastName}]: `) || existingCustomer.lastName;
      const email = readlineSync.question(`Email [${existingCustomer.email}]: `) || existingCustomer.email;
      const phone = readlineSync.question(`Phone [${existingCustomer.phone}]: `) || existingCustomer.phone;

      const updateData = {
        firstName,
        lastName,
        email,
        phone
      };

      const updateResult = await this.customersManager.updateCustomer(customerId, updateData);
      
      if (!updateResult.success) {
        console.error('❌ Error updating customer:', updateResult.message);
        return;
      }

      const updatedCustomer = updateResult.data;
      console.log('✅ Customer updated successfully!');
      this.displayCustomerDetails(updatedCustomer);
    } catch (error) {
      console.error('❌ Error updating customer:', error.message);
    }
  }

  async deleteCustomer() {
    console.log('\n🗑️ Delete Customer');
    console.log('─────────────────');
    
    try {
      const customerId = readlineSync.question('Enter Customer ID to delete: ');
      
      // First, get the customer to show details
      const getResult = await this.customersManager.getCustomerById(customerId);
      if (!getResult.success) {
        console.log('❌ Customer not found.\n');
        return;
      }

      const customer = getResult.data;
      console.log('\n📋 Customer to delete:');
      this.displayCustomerDetails(customer);

      const confirm = readlineSync.keyInYNStrict('⚠️  Are you sure you want to delete this customer? ');
      if (!confirm) {
        console.log('❌ Deletion cancelled.\n');
        return;
      }

      const deleteResult = await this.customersManager.deleteCustomer(customerId);
      
      if (!deleteResult.success) {
        console.error('❌ Error deleting customer:', deleteResult.message);
        return;
      }

      console.log('✅ Customer deleted successfully!\n');
    } catch (error) {
      console.error('❌ Error deleting customer:', error.message);
    }
  }

  async searchCustomers() {
    console.log('\n🔎 Search Customers');
    console.log('──────────────────');
    
    try {
      const searchTerm = readlineSync.question('Enter search term (name or email): ');
      
      const result = await this.customersManager.searchCustomers(searchTerm);
      
      if (!result.success) {
        console.error('❌ Error searching customers:', result.message);
        return;
      }

      const customers = result.data;
      
      if (!customers || customers.length === 0) {
        console.log('📭 No customers found matching your search.\n');
        return;
      }

      console.log(`\n📋 Found ${customers.length} customer(s):`);
      console.log('─────────────────────────────────');
      
      customers.forEach((customer, index) => {
        console.log(`${index + 1}. ${customer.firstName} ${customer.lastName}`);
        console.log(`   📧 ${customer.email}`);
        console.log(`   📞 ${customer.phone}`);
        console.log(`   🆔 ID: ${customer._id}`);
        console.log('   ─────────────────────────');
      });
      console.log();
    } catch (error) {
      console.error('❌ Error searching customers:', error.message);
    }
  }

  async viewStatistics() {
    console.log('\n📊 Customer Statistics');
    console.log('─────────────────────');
    
    try {
      const result = await this.customersManager.getStatistics();
      
      if (!result.success) {
        console.error('❌ Error fetching statistics:', result.message);
        return;
      }

      const stats = result.data;
      
      console.log(`📊 Total Customers: ${stats.totalCustomers}`);
      console.log(`📧 Unique Email Domains: ${stats.uniqueEmailDomains}`);
      console.log(`📞 Customers with Phone: ${stats.customersWithPhone}`);
      console.log(`📍 Customers with Address: ${stats.customersWithAddress}`);
      console.log(`📱 Customers with Social Media: ${stats.customersWithSocialMedia}`);
      console.log(`📅 New Customers This Month: ${stats.newCustomersThisMonth}`);
      
      if (stats.topEmailDomains && stats.topEmailDomains.length > 0) {
        console.log('\n🏆 Top Email Domains:');
        stats.topEmailDomains.forEach((domain, index) => {
          console.log(`   ${index + 1}. ${domain._id}: ${domain.count} customers`);
        });
      }
      console.log();
    } catch (error) {
      console.error('❌ Error fetching statistics:', error.message);
    }
  }

  displayCustomerDetails(customer) {
    console.log('┌─────────────────────────────────────┐');
    console.log('│           CUSTOMER DETAILS          │');
    console.log('├─────────────────────────────────────┤');
    console.log(`│ 👤 Name: ${customer.firstName} ${customer.lastName}`);
    console.log(`│ 📧 Email: ${customer.email}`);
    console.log(`│ 📞 Phone: ${customer.phone}`);
    console.log(`│ 🆔 ID: ${customer._id}`);
    console.log(`│ 📅 Created: ${new Date(customer.createdAt).toLocaleDateString()}`);
    console.log(`│ 📝 Updated: ${new Date(customer.updatedAt).toLocaleDateString()}`);
    console.log('└─────────────────────────────────────┘\n');
  }

  async run() {
    await this.initialize();

    while (true) {
      try {
        this.displayMenu();
        const choice = readlineSync.question('\n🎯 Choose an option (1-8): ');

        switch (choice) {
          case '1':
            await this.createCustomer();
            break;
          case '2':
            await this.listAllCustomers();
            break;
          case '3':
            await this.searchCustomerById();
            break;
          case '4':
            await this.updateCustomer();
            break;
          case '5':
            await this.deleteCustomer();
            break;
          case '6':
            await this.searchCustomers();
            break;
          case '7':
            await this.viewStatistics();
            break;
          case '8':
            console.log('\n👋 Thank you for using Customer Management System!');
            console.log('🔒 Disconnecting from database...');
            await this.customersManager.close();
            console.log('✅ Goodbye!\n');
            process.exit(0);
          default:
            console.log('❌ Invalid option. Please choose 1-8.\n');
        }

        // Pause before showing menu again
        readlineSync.question('\n⏸️  Press Enter to continue...');
        console.clear();
      } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        readlineSync.question('\n⏸️  Press Enter to continue...');
      }
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🔒 Shutting down gracefully...');
  process.exit(0);
});

// Start the application
const app = new CustomerConsoleApp();
app.run().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
