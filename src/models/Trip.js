const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required']
    },
    title: {
      type: String,
      required: [true, 'Trip title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title must not exceed 100 characters']
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
      minlength: [2, 'Destination must be at least 2 characters'],
      maxlength: [100, 'Destination must not exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must not exceed 500 characters'],
      default: ''
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    budget: {
      type: Number,
      min: [0, 'Budget must be a positive number'],
      default: 0
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'NGN'],
      default: 'USD'
    },
    status: {
      type: String,
      enum: ['planned', 'ongoing', 'completed', 'cancelled'],
      default: 'planned'
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [20, 'Tag must not exceed 20 characters']
      }
    ],
    isPublic: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    collection: 'trips'
  }
);

// Indexes for common queries
tripSchema.index({ ownerId: 1, createdAt: -1 });
tripSchema.index({ destination: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ startDate: 1 });

// Virtual for trip duration in days
tripSchema.virtual('durationDays').get(function () {
  const diffTime = Math.abs(this.endDate - this.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to check if trip is upcoming
tripSchema.methods.isUpcoming = function () {
  return this.startDate > new Date();
};

// Method to check if trip is active
tripSchema.methods.isActive = function () {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
};

// Method to check if trip is past
tripSchema.methods.isPast = function () {
  return this.endDate < new Date();
};

// Populate owner before returning
tripSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};

module.exports = mongoose.model('Trip', tripSchema);
