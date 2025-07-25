import mongoose from 'mongoose';

const { Schema } = mongoose;

const addressSchema = new Schema({
  street: {
    type: String,
    maxlength: 100,
    trim: true
  },
  city: {
    type: String,
    maxlength: 50,
    trim: true
  },
  state: {
    type: String,
    maxlength: 50,
    trim: true
  },
  country: {
    type: String,
    maxlength: 50,
    trim: true
  },
  zipCode: {
    type: String,
    maxlength: 20,
    trim: true
  }
}, { _id: false });

const socialMediaSchema = new Schema({
  facebook: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Facebook URL must be a valid URL'
    }
  },
  twitter: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Twitter URL must be a valid URL'
    }
  },
  instagram: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Instagram URL must be a valid URL'
    }
  },
  linkedin: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'LinkedIn URL must be a valid URL'
    }
  },
  youtube: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'YouTube URL must be a valid URL'
    }
  },
  tiktok: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'TikTok URL must be a valid URL'
    }
  },
  snapchat: {
    type: String,
    trim: true,
    maxlength: 50
  },
  whatsapp: {
    type: String,
    trim: true,
    maxlength: 20
  }
}, { _id: false });

const customerSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    minlength: [2, 'First name must be at least 2 characters long'],
    maxlength: [50, 'First name cannot exceed 50 characters'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    minlength: [2, 'Last name must be at least 2 characters long'],
    maxlength: [50, 'Last name cannot exceed 50 characters'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        return /^[\+]?[1-9][\d]{0,15}$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v <= new Date();
      },
      message: 'Date of birth cannot be in the future'
    }
  },
  address: addressSchema,
  socialMedia: socialMediaSchema,
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'suspended'],
      message: 'Status must be either active, inactive, or suspended'
    },
    default: 'active'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    trim: true
  },
  tags: [{
    type: String,
    maxlength: [30, 'Each tag cannot exceed 30 characters'],
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better query performance
// Note: email index is automatically created by the 'unique: true' property
customerSchema.index({ status: 1 });
customerSchema.index({ createdAt: -1 });
customerSchema.index({ firstName: 1, lastName: 1 });

// Virtual for full name
customerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });

// Pre-save middleware to update the updatedAt field
customerSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

// Pre-update middleware to update the updatedAt field
customerSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
