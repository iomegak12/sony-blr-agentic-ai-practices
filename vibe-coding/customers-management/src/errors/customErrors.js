export class CustomerError extends Error {
  constructor(message, statusCode = 500, code = 'CUSTOMER_ERROR') {
    super(message);
    this.name = 'CustomerError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

export class CustomerNotFoundError extends CustomerError {
  constructor(message = 'Customer not found') {
    super(message, 404, 'CUSTOMER_NOT_FOUND');
    this.name = 'CustomerNotFoundError';
  }
}

export class CustomerAlreadyExistsError extends CustomerError {
  constructor(message = 'Customer already exists') {
    super(message, 409, 'CUSTOMER_ALREADY_EXISTS');
    this.name = 'CustomerAlreadyExistsError';
  }
}

export class ValidationError extends CustomerError {
  constructor(message = 'Validation failed', errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class DatabaseError extends CustomerError {
  constructor(message = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

export class ConnectionError extends CustomerError {
  constructor(message = 'Database connection failed') {
    super(message, 500, 'CONNECTION_ERROR');
    this.name = 'ConnectionError';
  }
}
