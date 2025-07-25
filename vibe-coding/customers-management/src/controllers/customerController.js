import customerService from '../services/customerService.js';
import {
  CustomerError,
  CustomerNotFoundError,
  CustomerAlreadyExistsError,
  ValidationError,
  DatabaseError,
  ConnectionError
} from '../errors/customErrors.js';

class CustomerController {
  /**
   * Create a new customer
   */
  async createCustomer(customerData) {
    try {
      const customer = await customerService.createCustomer(customerData);
      return {
        success: true,
        data: customer,
        message: 'Customer created successfully'
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(customerId) {
    try {
      const customer = await customerService.getCustomerById(customerId);
      return {
        success: true,
        data: customer
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get customer by email
   */
  async getCustomerByEmail(email) {
    try {
      const customer = await customerService.getCustomerByEmail(email);
      return {
        success: true,
        data: customer
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get all customers with filtering and pagination
   */
  async getAllCustomers(options = {}) {
    try {
      const result = await customerService.getAllCustomers(options);
      return {
        success: true,
        data: result.customers,
        pagination: result.pagination,
        message: `Retrieved ${result.customers.length} customers`
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update customer by ID
   */
  async updateCustomer(customerId, updateData) {
    try {
      const customer = await customerService.updateCustomer(customerId, updateData);
      return {
        success: true,
        data: customer,
        message: 'Customer updated successfully'
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete customer by ID
   */
  async deleteCustomer(customerId) {
    try {
      const result = await customerService.deleteCustomer(customerId);
      return {
        success: true,
        data: result.deletedCustomer,
        message: result.message
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get customers by status
   */
  async getCustomersByStatus(status, options = {}) {
    try {
      const result = await customerService.getCustomersByStatus(status, options);
      return {
        success: true,
        data: result.customers,
        pagination: result.pagination,
        message: `Retrieved ${result.customers.length} ${status} customers`
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Search customers
   */
  async searchCustomers(searchTerm, options = {}) {
    try {
      const result = await customerService.searchCustomers(searchTerm, options);
      return {
        success: true,
        data: result.customers,
        pagination: result.pagination,
        message: `Found ${result.customers.length} customers matching "${searchTerm}"`
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get customer statistics
   */
  async getCustomerStats() {
    try {
      const stats = await customerService.getCustomerStats();
      return {
        success: true,
        data: stats,
        message: 'Customer statistics retrieved successfully'
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Handle and format errors
   */
  handleError(error) {
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: {
          type: 'ValidationError',
          message: error.message,
          details: error.errors || [],
          statusCode: error.statusCode
        }
      };
    }

    if (error instanceof CustomerNotFoundError) {
      return {
        success: false,
        error: {
          type: 'CustomerNotFoundError',
          message: error.message,
          statusCode: error.statusCode
        }
      };
    }

    if (error instanceof CustomerAlreadyExistsError) {
      return {
        success: false,
        error: {
          type: 'CustomerAlreadyExistsError',
          message: error.message,
          statusCode: error.statusCode
        }
      };
    }

    if (error instanceof DatabaseError) {
      return {
        success: false,
        error: {
          type: 'DatabaseError',
          message: error.message,
          statusCode: error.statusCode
        }
      };
    }

    if (error instanceof ConnectionError) {
      return {
        success: false,
        error: {
          type: 'ConnectionError',
          message: error.message,
          statusCode: error.statusCode
        }
      };
    }

    if (error instanceof CustomerError) {
      return {
        success: false,
        error: {
          type: 'CustomerError',
          message: error.message,
          statusCode: error.statusCode
        }
      };
    }

    // Unknown error
    return {
      success: false,
      error: {
        type: 'UnknownError',
        message: 'An unexpected error occurred',
        statusCode: 500,
        originalError: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    };
  }
}

export default new CustomerController();
