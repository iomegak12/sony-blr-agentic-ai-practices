// Main entry point for the customers-management library
import DatabaseConnection from './config/database.js';
import CustomerController from './controllers/customerController.js';
import CustomerService from './services/customerService.js';
import Customer from './models/Customer.js';
import {
  customerValidationSchema,
  customerUpdateValidationSchema,
  validateCustomer,
  validateCustomerUpdate
} from './validations/customerValidation.js';
import {
  CustomerError,
  CustomerNotFoundError,
  CustomerAlreadyExistsError,
  ValidationError,
  DatabaseError,
  ConnectionError
} from './errors/customErrors.js';

/**
 * CustomersManagement - Main class for customer management operations
 */
class CustomersManagement {
  constructor() {
    this.db = DatabaseConnection;
    this.controller = CustomerController;
    this.service = CustomerService;
    this.model = Customer;
    this.isInitialized = false;
  }

  /**
   * Initialize the library with database connection
   * @param {string} mongoUri - MongoDB connection URI
   * @param {Object} options - Connection options
   * @returns {Promise<void>}
   */
  async initialize(mongoUri, options = {}) {
    try {
      await this.db.connect(mongoUri, options);
      this.isInitialized = true;
      console.log('CustomersManagement library initialized successfully');
    } catch (error) {
      throw new ConnectionError(`Failed to initialize CustomersManagement: ${error.message}`);
    }
  }

  /**
   * Close database connection
   * @returns {Promise<void>}
   */
  async close() {
    try {
      await this.db.disconnect();
      this.isInitialized = false;
      console.log('CustomersManagement library closed successfully');
    } catch (error) {
      throw new ConnectionError(`Failed to close CustomersManagement: ${error.message}`);
    }
  }

  /**
   * Check if the library is properly initialized
   */
  checkInitialization() {
    if (!this.isInitialized || !this.db.isConnectionActive()) {
      throw new ConnectionError('CustomersManagement not initialized. Call initialize() first.');
    }
  }

  // Customer CRUD Operations

  /**
   * Create a new customer
   * @param {Object} customerData - Customer data
   * @returns {Promise<Object>} Created customer
   */
  async createCustomer(customerData) {
    this.checkInitialization();
    return await this.controller.createCustomer(customerData);
  }

  /**
   * Get customer by ID
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Customer data
   */
  async getCustomerById(customerId) {
    this.checkInitialization();
    return await this.controller.getCustomerById(customerId);
  }

  /**
   * Get customer by email
   * @param {string} email - Customer email
   * @returns {Promise<Object>} Customer data
   */
  async getCustomerByEmail(email) {
    this.checkInitialization();
    return await this.controller.getCustomerByEmail(email);
  }

  /**
   * Get all customers with optional filtering and pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Customers list with pagination
   */
  async getAllCustomers(options = {}) {
    this.checkInitialization();
    return await this.controller.getAllCustomers(options);
  }

  /**
   * Update customer by ID
   * @param {string} customerId - Customer ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated customer
   */
  async updateCustomer(customerId, updateData) {
    this.checkInitialization();
    return await this.controller.updateCustomer(customerId, updateData);
  }

  /**
   * Delete customer by ID
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteCustomer(customerId) {
    this.checkInitialization();
    return await this.controller.deleteCustomer(customerId);
  }

  /**
   * Get customers by status
   * @param {string} status - Customer status
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Customers with specified status
   */
  async getCustomersByStatus(status, options = {}) {
    this.checkInitialization();
    return await this.controller.getCustomersByStatus(status, options);
  }

  /**
   * Search customers by name or email
   * @param {string} searchTerm - Search term
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Matching customers
   */
  async searchCustomers(searchTerm, options = {}) {
    this.checkInitialization();
    return await this.controller.searchCustomers(searchTerm, options);
  }

  /**
   * Get customer statistics
   * @returns {Promise<Object>} Customer statistics
   */
  async getCustomerStats() {
    this.checkInitialization();
    return await this.controller.getCustomerStats();
  }

  // Utility methods

  /**
   * Validate customer data
   * @param {Object} customerData - Customer data to validate
   * @returns {Object} Validated data
   */
  validateCustomer(customerData) {
    return validateCustomer(customerData);
  }

  /**
   * Validate customer update data
   * @param {Object} updateData - Update data to validate
   * @returns {Object} Validated data
   */
  validateCustomerUpdate(updateData) {
    return validateCustomerUpdate(updateData);
  }

  /**
   * Get database connection status
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this.db.isConnectionActive();
  }

  /**
   * Get direct access to the Customer model
   * @returns {Object} Mongoose Customer model
   */
  getModel() {
    this.checkInitialization();
    return this.model;
  }

  /**
   * Get direct access to the service layer
   * @returns {Object} Customer service
   */
  getService() {
    this.checkInitialization();
    return this.service;
  }
}

// Export the main class and individual components
export default CustomersManagement;

export {
  CustomersManagement,
  DatabaseConnection,
  CustomerController,
  CustomerService,
  Customer,
  customerValidationSchema,
  customerUpdateValidationSchema,
  validateCustomer,
  validateCustomerUpdate,
  CustomerError,
  CustomerNotFoundError,
  CustomerAlreadyExistsError,
  ValidationError,
  DatabaseError,
  ConnectionError
};
