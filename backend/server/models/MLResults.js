import mongoose from 'mongoose';

const mlResultsSchema = new mongoose.Schema({
  user_details: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserDetails',
    required: true
  },
  risk_score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  loan_approval_probability: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  suggested_loan_amount: {
    type: Number,
    required: true,
    min: 0
  },
  suggested_interest_rate: {
    type: Number,
    required: true,
    min: 0
  },
  repayment_period_months: {
    type: Number,
    required: true,
    min: 1
  },
  model_confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  model_version: {
    type: String,
    required: true
  },
  features_used: [{
    name: String,
    value: mongoose.Schema.Types.Mixed,
    importance: Number
  }],
  processed_at: {
    type: Date,
    default: Date.now
  }
});

const MLResults = mongoose.model('MLResults', mlResultsSchema);

export default MLResults; 