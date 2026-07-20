const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Trip ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Itinerary title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [100, 'Title must not exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must not exceed 500 characters'],
      default: ''
    },
    activityDate: {
      type: Date,
      required: [true, 'Activity date is required']
    },
    time: {
      type: String,
      trim: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format'],
      required: [true, 'Time is required']
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location must not exceed 200 characters'],
      default: ''
    },
    estimatedCost: {
      type: Number,
      min: [0, 'Estimated cost must be a positive number'],
      default: 0
    },
    status: {
      type: String,
      enum: ['planned', 'completed', 'cancelled'],
      default: 'planned'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },
  {
    timestamps: true,
    collection: 'itineraries'
  }
);

// Indexes for common queries
itinerarySchema.index({ tripId: 1, activityDate: 1, time: 1 });
itinerarySchema.index({ tripId: 1, status: 1 });

module.exports = mongoose.model('Itinerary', itinerarySchema);
