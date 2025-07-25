import Joi from 'joi';

export const customerValidationSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .trim()
    .messages({
      'string.empty': 'First name is required',
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters'
    }),

  lastName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .trim()
    .messages({
      'string.empty': 'Last name is required',
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters'
    }),

  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address'
    }),

  phone: Joi.string()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Please provide a valid phone number'
    }),

  dateOfBirth: Joi.date()
    .max('now')
    .optional()
    .messages({
      'date.max': 'Date of birth cannot be in the future'
    }),

  address: Joi.object({
    street: Joi.string().max(100).optional(),
    city: Joi.string().max(50).optional(),
    state: Joi.string().max(50).optional(),
    country: Joi.string().max(50).optional(),
    zipCode: Joi.string().max(20).optional()
  }).optional(),

  socialMedia: Joi.object({
    facebook: Joi.string().uri().optional().allow(''),
    twitter: Joi.string().uri().optional().allow(''),
    instagram: Joi.string().uri().optional().allow(''),
    linkedin: Joi.string().uri().optional().allow(''),
    youtube: Joi.string().uri().optional().allow(''),
    tiktok: Joi.string().uri().optional().allow(''),
    snapchat: Joi.string().optional().allow(''),
    whatsapp: Joi.string().optional().allow('')
  }).optional(),

  status: Joi.string()
    .valid('active', 'inactive', 'suspended')
    .default('active')
    .messages({
      'any.only': 'Status must be either active, inactive, or suspended'
    }),

  notes: Joi.string().max(500).optional().allow(''),

  tags: Joi.array().items(Joi.string().max(30)).max(10).optional()
});

export const customerUpdateValidationSchema = customerValidationSchema.fork(
  ['firstName', 'lastName', 'email', 'phone'],
  (schema) => schema.optional()
);

export const validateCustomer = (data) => {
  const { error, value } = customerValidationSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const validationErrors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    throw new ValidationError('Validation failed', validationErrors);
  }

  return value;
};

export const validateCustomerUpdate = (data) => {
  const { error, value } = customerUpdateValidationSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const validationErrors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    throw new ValidationError('Validation failed', validationErrors);
  }

  return value;
};

class ValidationError extends Error {
  constructor(message, errors) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export { ValidationError };
