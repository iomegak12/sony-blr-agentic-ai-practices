# Customers Management Library

A comprehensive Node.js library for managing customer data with MongoDB integration, built with Mongoose ORM and Joi validation.

## Features

- ✅ Complete CRUD operations for customer management
- ✅ MongoDB integration with Mongoose ORM
- ✅ Comprehensive Joi validation schemas
- ✅ Social media profile management
- ✅ Advanced search and filtering capabilities
- ✅ Pagination support
- ✅ Customer statistics and analytics
- ✅ Robust error handling with custom exceptions
- ✅ ES6 modules support
- ✅ Node.js v22 compatibility
- ✅ Modular architecture

## Installation

```bash
npm install
```

## Prerequisites

- Node.js v22 or higher
- MongoDB database
- Dependencies: mongoose, joi

## Library Usage

```javascript
import CustomersManagement from './src/index.js';

// Initialize the library
const customersManager = new CustomersManagement();
await customersManager.initialize('mongodb://localhost:27017/customers-management');

// Create a customer
const result = await customersManager.createCustomer({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  address: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    zipCode: '10001'
  },
  socialMedia: {
    facebook: 'https://facebook.com/johndoe',
    twitter: 'https://twitter.com/johndoe',
    instagram: 'https://instagram.com/johndoe',
    linkedin: 'https://linkedin.com/in/johndoe'
  },
  status: 'active',
  notes: 'VIP customer',
  tags: ['vip', 'premium']
});

// Close connection when done
await customersManager.close();
```

## Customer Schema

### Required Fields
- `firstName` (string, 2-50 characters)
- `lastName` (string, 2-50 characters)
- `email` (string, valid email format, unique)
- `phone` (string, valid phone number format)

### Optional Fields
- `dateOfBirth` (date, cannot be in the future)
- `address` (object with street, city, state, country, zipCode)
- `socialMedia` (object with social platform URLs and handles)
- `status` (enum: 'active', 'inactive', 'suspended', default: 'active')
- `notes` (string, max 500 characters)
- `tags` (array of strings, max 10 tags, each max 30 characters)

### Social Media Fields
- `facebook` (URL)
- `twitter` (URL)
- `instagram` (URL)
- `linkedin` (URL)
- `youtube` (URL)
- `tiktok` (URL)
- `snapchat` (username)
- `whatsapp` (phone number)

## API Reference

### Initialization

#### `initialize(mongoUri, options)`
Initialize the library with MongoDB connection.

```javascript
await customersManager.initialize('mongodb://localhost:27017/customers-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
```

#### `close()`
Close the database connection.

```javascript
await customersManager.close();
```

### CRUD Operations

#### `createCustomer(customerData)`
Create a new customer.

```javascript
const result = await customersManager.createCustomer({
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  phone: '+1987654321'
});
```

#### `getCustomerById(customerId)`
Retrieve a customer by ID.

```javascript
const result = await customersManager.getCustomerById('60f1b2b5b3f3f3f3f3f3f3f3');
```

#### `getCustomerByEmail(email)`
Retrieve a customer by email address.

```javascript
const result = await customersManager.getCustomerByEmail('jane.smith@example.com');
```

#### `getAllCustomers(options)`
Retrieve all customers with optional filtering and pagination.

```javascript
const result = await customersManager.getAllCustomers({
  page: 1,
  limit: 10,
  status: 'active',
  search: 'john',
  sortBy: 'createdAt',
  sortOrder: 'desc'
});
```

#### `updateCustomer(customerId, updateData)`
Update an existing customer.

```javascript
const result = await customersManager.updateCustomer('60f1b2b5b3f3f3f3f3f3f3f3', {
  notes: 'Updated customer information',
  status: 'inactive'
});
```

#### `deleteCustomer(customerId)`
Delete a customer by ID.

```javascript
const result = await customersManager.deleteCustomer('60f1b2b5b3f3f3f3f3f3f3f3');
```

### Search and Filter Operations

#### `searchCustomers(searchTerm, options)`
Search customers by name or email.

```javascript
const result = await customersManager.searchCustomers('john', {
  page: 1,
  limit: 10
});
```

#### `getCustomersByStatus(status, options)`
Get customers filtered by status.

```javascript
const result = await customersManager.getCustomersByStatus('active', {
  page: 1,
  limit: 10
});
```

### Analytics

#### `getCustomerStats()`
Get customer statistics and analytics.

```javascript
const result = await customersManager.getCustomerStats();
// Returns: { total, active, inactive, suspended, byStatus: { ... } }
```

### Validation

#### `validateCustomer(customerData)`
Validate customer data using Joi schema.

```javascript
try {
  const validatedData = customersManager.validateCustomer(customerData);
} catch (error) {
  console.error('Validation errors:', error.errors);
}
```

#### `validateCustomerUpdate(updateData)`
Validate customer update data.

```javascript
try {
  const validatedData = customersManager.validateCustomerUpdate(updateData);
} catch (error) {
  console.error('Validation errors:', error.errors);
}
```

## Response Format

All operations return a standardized response format:

### Success Response
```javascript
{
  success: true,
  data: { /* customer data or operation result */ },
  message: "Operation completed successfully",
  pagination: { /* pagination info for list operations */ }
}
```

### Error Response
```javascript
{
  success: false,
  error: {
    type: "ValidationError",
    message: "Validation failed",
    details: [/* array of validation errors */],
    statusCode: 400
  }
}
```

## Error Types

- `ValidationError` - Data validation failures
- `CustomerNotFoundError` - Customer not found
- `CustomerAlreadyExistsError` - Duplicate customer
- `DatabaseError` - Database operation failures
- `ConnectionError` - Database connection issues

## Project Structure

```
customers-management/
├── src/
│   ├── config/
│   │   └── database.js          # Database connection management
│   ├── models/
│   │   └── Customer.js          # Mongoose customer model
│   ├── validations/
│   │   └── customerValidation.js # Joi validation schemas
│   ├── services/
│   │   └── customerService.js   # Business logic layer
│   ├── controllers/
│   │   └── customerController.js # Controller layer
│   ├── errors/
│   │   └── customErrors.js      # Custom error classes
│   └── index.js                 # Main library entry point
├── package.json
└── README.md
```

## Usage Examples

This library is designed to be imported and used in your Node.js applications. Here's how to get started:

## Development

### Running in Development Mode
```bash
npm run dev
```

This uses Node.js `--watch` flag for automatic restarts during development.

## License

MIT License

## Contributing

1. Follow the modular architecture
2. Include comprehensive Joi validations
3. Handle errors appropriately with custom error classes
4. Maintain ES6 module compatibility
5. Ensure Node.js v22 compatibility
