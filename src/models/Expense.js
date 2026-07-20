const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Trip ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [120, 'Title must not exceed 120 characters']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be a positive number']
    },
    category: {
      type: String,
      enum: ['transport', 'accommodation', 'food', 'activity', 'shopping', 'other'],
      default: 'other'
    },
    date: {
      type: Date,
      required: [true, 'Expense date is required']
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes must not exceed 500 characters'],
      default: ''
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'NGN'],
      default: 'USD'
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'transfer', 'mobile', 'other'],
      default: 'other'
    }
  },
  {
    timestamps: true,
    collection: 'expenses'
  }
);

// Indexes for common queries
expenseSchema.index({ tripId: 1, date: -1 });
expenseSchema.index({ tripId: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
