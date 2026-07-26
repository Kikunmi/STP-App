const BaseRepository = require('./BaseRepository');
const SharedTrip = require('../models/SharedTrip');

class SharedTripRepository extends BaseRepository {
  constructor() {
    super(SharedTrip);
  }

  async findByTripAndSharedUser(tripId, sharedUserId) {
    try {
      return await this.findOne({ tripId, sharedUserId });
    } catch (error) {
      throw new Error(`Error finding shared trip relation: ${error.message}`);
    }
  }

  async findByTripId(tripId) {
    try {
      return await this.model
        .find({ tripId })
        .sort({ createdAt: -1 })
        .populate('sharedUserId', 'username email');
    } catch (error) {
      throw new Error(`Error finding shared users by trip: ${error.message}`);
    }
  }

  async findTripsSharedWithUser(sharedUserId) {
    try {
      return await this.model
        .find({ sharedUserId })
        .sort({ createdAt: -1 })
        .populate('tripId')
        .populate('ownerId', 'username email');
    } catch (error) {
      throw new Error(`Error finding trips shared with user: ${error.message}`);
    }
  }

  async createShare(data) {
    try {
      return await this.create(data);
    } catch (error) {
      throw new Error(`Error creating share: ${error.message}`);
    }
  }

  async deleteShareByTripAndUser(tripId, sharedUserId) {
    try {
      return await this.model.findOneAndDelete({ tripId, sharedUserId });
    } catch (error) {
      throw new Error(`Error deleting share: ${error.message}`);
    }
  }

  async isTripSharedWithUser(tripId, userId) {
    try {
      return Boolean(await this.exists({ tripId, sharedUserId: userId }));
    } catch (error) {
      throw new Error(`Error checking trip share: ${error.message}`);
    }
  }
}

module.exports = SharedTripRepository;
