import mongoose from 'mongoose';

const userDetailsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  business_name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  business_type: {
    type: String,
    required: [true, 'Business type is required'],
    trim: true
  },
  annual_revenue: {
    type: Number,
    required: [true, 'Annual revenue is required'],
    min: [0, 'Annual revenue cannot be negative']
  },
  loan_amount: {
    type: Number,
    required: [true, 'Loan amount is required'],
    min: [0, 'Loan amount cannot be negative']
  },
  loan_purpose: {
    type: String,
    required: [true, 'Loan purpose is required'],
    trim: true
  },
  credit_score: {
    type: Number,
    required: [true, 'Credit score is required'],
    min: [300, 'Credit score must be at least 300'],
    max: [850, 'Credit score cannot exceed 850']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submitted_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field before saving
userDetailsSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

const UserDetails = mongoose.model('UserDetails', userDetailsSchema);

export default UserDetails; 