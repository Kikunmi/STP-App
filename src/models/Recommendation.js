const mongoose = require('mongoose');

const recommendationItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['accommodation', 'restaurant', 'activity', 'transport', 'attraction', 'general'],
      required: [true, 'Recommendation type is required']
    },
    title: {
      type: String,
      required: [true, 'Recommendation title is required'],
      trim: true,
      maxlength: [200, 'Title must not exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description must not exceed 1000 characters'],
      default: ''
    },
    estimatedCost: {
      type: Number,
      min: [0, 'Estimated cost must be a positive number'],
      default: null
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [500, 'Reason must not exceed 500 characters'],
      default: ''
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    }
  },
  { _id: true }
);

const recommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
      index: true
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
      minlength: [2, 'Destination must be at least 2 characters'],
      maxlength: [100, 'Destination must not exceed 100 characters']
    },
    travelDates: {
      start: { type: Date, default: null },
      end: { type: Date, default: null }
    },
    budget: {
      type: Number,
      min: [0, 'Budget must be a positive number'],
      default: null
    },
    preferences: {
      type: [String],
      default: []
    },
    recommendations: {
      type: [recommendationItemSchema],
      required: true,
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length > 0;
        },
        message: 'At least one recommendation item is required'
      }
    },
    metadata: {
      source: {
        type: String,
        enum: ['rule-based', 'trip-context', 'external'],
        default: 'rule-based'
      },
      generatedAt: {
        type: Date,
        default: Date.now
      },
      inputHash: {
        type: String,
        default: null
      }
    }
  },
  {
    timestamps: true,
    collection: 'recommendations'
  }
);

recommendationSchema.index({ userId: 1, createdAt: -1 });
recommendationSchema.index({ tripId: 1, userId: 1 });
recommendationSchema.index({ userId: 1, destination: 1 });

module.exports = mongoose.model('Recommendation', recommendationSchema);
