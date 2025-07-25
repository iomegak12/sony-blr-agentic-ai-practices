import Customer from '../models/Customer.js';
import {
  validateCustomer,
  validateCustomerUpdate,
  ValidationError as JoiValidationError
} from '../validations/customerValidation.js';
import {
  CustomerError,
  CustomerNotFoundError,
  CustomerAlreadyExistsError,
  ValidationError,
  DatabaseError
} from '../errors/customErrors.js';
import mongoose from 'mongoose';

class CustomerService {
  /**
   * Create a new customer
   * @param {Object} customerData - Customer data
   * @returns {Object} Created customer
   */
  async createCustomer(customerData) {
    try {
      // Validate customer data using Joi
      const validatedData = validateCustomer(customerData);

      // Check if customer with email already exists
      const existingCustomer = await Customer.findOne({ email: validatedData.email });
      if (existingCustomer) {
        throw new CustomerAlreadyExistsError(`Customer with email ${validatedData.email} already exists`);
      }

      // Create new customer
      const customer = new Customer(validatedData);
      const savedCustomer = await customer.save();

      return this.formatCustomerResponse(savedCustomer);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get customer by ID
   * @param {string} customerId - Customer ID
   * @returns {Object} Customer data
   */
  async getCustomerById(customerId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        throw new ValidationError('Invalid customer ID format');
      }

      const customer = await Customer.findById(customerId);
      if (!customer) {
        throw new CustomerNotFoundError(`Customer with ID ${customerId} not found`);
      }

      return this.formatCustomerResponse(customer);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get customer by email
   * @param {string} email - Customer email
   * @returns {Object} Customer data
   */
  async getCustomerByEmail(email) {
    try {
      if (!email || typeof email !== 'string') {
        throw new ValidationError('Valid email is required');
      }

      const customer = await Customer.findOne({ email: email.toLowerCase() });
      if (!customer) {
        throw new CustomerNotFoundError(`Customer with email ${email} not found`);
      }

      return this.formatCustomerResponse(customer);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get all customers with optional filtering and pagination
   * @param {Object} options - Query options
   * @returns {Object} Customers list with pagination info
   */
  async getAllCustomers(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      // Build query
      const query = {};
      if (status) {
        query.status = status;
      }

      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Execute query
      const [customers, totalCount] = await Promise.all([
        Customer.find(query)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Customer.countDocuments(query)
      ]);

      return {
        customers: customers.map(customer => this.formatCustomerResponse(customer)),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNextPage: page * limit < totalCount,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Update customer by ID
   * @param {string} customerId - Customer ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated customer
   */
  async updateCustomer(customerId, updateData) {
    try {
      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        throw new ValidationError('Invalid customer ID format');
      }

      // Validate update data using Joi
      const validatedData = validateCustomerUpdate(updateData);

      // If email is being updated, check for duplicates
      if (validatedData.email) {
        const existingCustomer = await Customer.findOne({
          email: validatedData.email,
          _id: { $ne: customerId }
        });
        if (existingCustomer) {
          throw new CustomerAlreadyExistsError(`Customer with email ${validatedData.email} already exists`);
        }
      }

      const updatedCustomer = await Customer.findByIdAndUpdate(
        customerId,
        validatedData,
        { new: true, runValidators: true }
      );

      if (!updatedCustomer) {
        throw new CustomerNotFoundError(`Customer with ID ${customerId} not found`);
      }

      return this.formatCustomerResponse(updatedCustomer);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Delete customer by ID
   * @param {string} customerId - Customer ID
   * @returns {Object} Deletion confirmation
   */
  async deleteCustomer(customerId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        throw new ValidationError('Invalid customer ID format');
      }

      const deletedCustomer = await Customer.findByIdAndDelete(customerId);
      if (!deletedCustomer) {
        throw new CustomerNotFoundError(`Customer with ID ${customerId} not found`);
      }

      return {
        success: true,
        message: 'Customer deleted successfully',
        deletedCustomer: this.formatCustomerResponse(deletedCustomer)
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get customers by status
   * @param {string} status - Customer status
   * @param {Object} options - Query options
   * @returns {Array} Customers with specified status
   */
  async getCustomersByStatus(status, options = {}) {
    try {
      const validStatuses = ['active', 'inactive', 'suspended'];
      if (!validStatuses.includes(status)) {
        throw new ValidationError('Invalid status. Must be one of: active, inactive, suspended');
      }

      return await this.getAllCustomers({ ...options, status });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Search customers by name or email
   * @param {string} searchTerm - Search term
   * @param {Object} options - Query options
   * @returns {Array} Matching customers
   */
  async searchCustomers(searchTerm, options = {}) {
    try {
      if (!searchTerm || typeof searchTerm !== 'string') {
        throw new ValidationError('Search term is required');
      }

      return await this.getAllCustomers({ ...options, search: searchTerm });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get customer statistics
   * @returns {Object} Customer statistics
   */
  async getCustomerStats() {
    try {
      const [totalCustomers, activeCustomers, inactiveCustomers, suspendedCustomers] = await Promise.all([
        Customer.countDocuments(),
        Customer.countDocuments({ status: 'active' }),
        Customer.countDocuments({ status: 'inactive' }),
        Customer.countDocuments({ status: 'suspended' })
      ]);

      return {
        total: totalCustomers,
        active: activeCustomers,
        inactive: inactiveCustomers,
        suspended: suspendedCustomers,
        byStatus: {
          active: Math.round((activeCustomers / totalCustomers) * 100) || 0,
          inactive: Math.round((inactiveCustomers / totalCustomers) * 100) || 0,
          suspended: Math.round((suspendedCustomers / totalCustomers) * 100) || 0
        }
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Format customer response
   * @param {Object} customer - Raw customer object
   * @returns {Object} Formatted customer object
   */
  formatCustomerResponse(customer) {
    const customerObj = customer.toObject ? customer.toObject() : customer;
    
    return {
      id: customerObj._id,
      firstName: customerObj.firstName,
      lastName: customerObj.lastName,
      fullName: customerObj.fullName || `${customerObj.firstName} ${customerObj.lastName}`,
      email: customerObj.email,
      phone: customerObj.phone,
      dateOfBirth: customerObj.dateOfBirth,
      address: customerObj.address,
      socialMedia: customerObj.socialMedia,
      status: customerObj.status,
      notes: customerObj.notes,
      tags: customerObj.tags || [],
      createdAt: customerObj.createdAt,
      updatedAt: customerObj.updatedAt
    };
  }

  /**
   * Handle and transform errors
   * @param {Error} error - Error object
   */
  handleError(error) {
    if (error instanceof JoiValidationError) {
      throw new ValidationError(error.message, error.errors);
    }

    if (error instanceof CustomerError) {
      throw error;
    }

    if (error.name === 'ValidationError' && error.errors) {
      // Mongoose validation error
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      throw new ValidationError('Validation failed', validationErrors);
    }

    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      throw new CustomerAlreadyExistsError(`Customer with this ${field} already exists`);
    }

    if (error.name === 'CastError') {
      throw new ValidationError('Invalid data format');
    }

    // Unknown error
    throw new DatabaseError(error.message || 'An unexpected error occurred');
  }
}

export default new CustomerService();
