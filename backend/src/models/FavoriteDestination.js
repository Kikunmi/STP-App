const mongoose = require('mongoose');

const favoriteDestinationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    destinationName: {
      type: String,
      required: [true, 'Destination name is required'],
      trim: true,
      minlength: [2, 'Destination name must be at least 2 characters'],
      maxlength: [120, 'Destination name must not exceed 120 characters']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      minlength: [2, 'Country must be at least 2 characters'],
      maxlength: [80, 'Country must not exceed 80 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [80, 'City must not exceed 80 characters'],
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes must not exceed 500 characters'],
      default: ''
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length <= 15;
        },
        message: 'Tags cannot exceed 15 items'
      }
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
      default: 3
    },
    visited: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    collection: 'favorite_destinations'
  }
);

// Prevent duplicate favorites for same user + destination + country
favoriteDestinationSchema.index({ userId: 1, destinationName: 1, country: 1 }, { unique: true });
favoriteDestinationSchema.index({ userId: 1, createdAt: -1 });
favoriteDestinationSchema.index({ userId: 1, visited: 1 });

module.exports = mongoose.model('FavoriteDestination', favoriteDestinationSchema);
