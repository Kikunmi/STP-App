const mongoose = require('mongoose');

const sharedTripSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Trip ID is required']
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required']
    },
    sharedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Shared user ID is required']
    }
  },
  {
    timestamps: true,
    collection: 'shared_trips'
  }
);

sharedTripSchema.index({ tripId: 1, sharedUserId: 1 }, { unique: true });
sharedTripSchema.index({ ownerId: 1, tripId: 1 });
sharedTripSchema.index({ sharedUserId: 1, createdAt: -1 });
sharedTripSchema.index({ tripId: 1, createdAt: -1 });

module.exports = mongoose.model('SharedTrip', sharedTripSchema);
