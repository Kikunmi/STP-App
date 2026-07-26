const BaseRepository = require('./BaseRepository');
const Trip = require('../models/Trip');

/**
 * Trip Repository
 * Extends BaseRepository with trip-specific database operations
 */
class TripRepository extends BaseRepository {
  constructor() {
    super(Trip);
  }

  /**
   * Find trips by owner ID with pagination
   * @param {string} ownerId - User ID
   * @param {Object} options - Query options (page, limit, sort, status)
   * @returns {Promise<Array>} Array of trips
   */
  async findByOwnerId(ownerId, options = {}) {
    try {
      const { page = 1, limit = 10, sort = 'createdAt', status } = options;
      const skip = (page - 1) * limit;
      const query = { ownerId };

      if (status) {
        query.status = status;
      }

      const [trips, total] = await Promise.all([
        this.model
          .find(query)
          .sort({ [sort]: -1 })
          .skip(skip)
          .limit(limit)
          .populate('ownerId', 'username email')
          .populate('participants', 'username email'),
        this.model.countDocuments(query)
      ]);

      return {
        trips,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new Error(`Error finding trips by owner: ${error.message}`);
    }
  }

  /**
   * Find trips by destination
   * @param {string} destination - Destination to search
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of trips
   */
  async findByDestination(destination, options = {}) {
    try {
      const { limit = 20 } = options;
      return await this.model
        .find({
          destination: new RegExp(destination, 'i'),
          isPublic: true
        })
        .limit(limit)
        .populate('ownerId', 'username');
    } catch (error) {
      throw new Error(`Error finding trips by destination: ${error.message}`);
    }
  }

  /**
   * Find trips by status
   * @param {string} status - Trip status
   * @param {string} ownerId - Owner ID (optional)
   * @returns {Promise<Array>} Array of trips
   */
  async findByStatus(status, ownerId = null) {
    try {
      const query = { status };
      if (ownerId) {
        query.ownerId = ownerId;
      }

      return await this.model.find(query).populate('ownerId', 'username');
    } catch (error) {
      throw new Error(`Error finding trips by status: ${error.message}`);
    }
  }

  /**
   * Find upcoming trips
   * @param {string} ownerId - Owner ID (optional)
   * @returns {Promise<Array>} Array of upcoming trips
   */
  async findUpcoming(ownerId = null) {
    try {
      const query = {
        startDate: { $gt: new Date() }
      };
      if (ownerId) {
        query.ownerId = ownerId;
      }

      return await this.model
        .find(query)
        .sort({ startDate: 1 })
        .populate('ownerId', 'username');
    } catch (error) {
      throw new Error(`Error finding upcoming trips: ${error.message}`);
    }
  }

  /**
   * Find active trips (currently happening)
   * @param {string} ownerId - Owner ID (optional)
   * @returns {Promise<Array>} Array of active trips
   */
  async findActive(ownerId = null) {
    try {
      const now = new Date();
      const query = {
        startDate: { $lte: now },
        endDate: { $gte: now }
      };
      if (ownerId) {
        query.ownerId = ownerId;
      }

      return await this.model
        .find(query)
        .populate('ownerId', 'username');
    } catch (error) {
      throw new Error(`Error finding active trips: ${error.message}`);
    }
  }

  /**
   * Search trips
   * @param {string} searchQuery - Search term
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of matching trips
   */
  async searchTrips(searchQuery, options = {}) {
    try {
      const { ownerId, limit = 20 } = options;
      const query = {
        $or: [
          { title: new RegExp(searchQuery, 'i') },
          { destination: new RegExp(searchQuery, 'i') },
          { description: new RegExp(searchQuery, 'i') }
        ]
      };

      if (ownerId) {
        query.ownerId = ownerId;
      }

      return await this.model
        .find(query)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('ownerId', 'username');
    } catch (error) {
      throw new Error(`Error searching trips: ${error.message}`);
    }
  }

  /**
   * Create a new trip
   * @param {Object} tripData - Trip data
   * @returns {Promise<Object>} Created trip
   */
  async createTrip(tripData) {
    try {
      return await this.create(tripData);
    } catch (error) {
      throw new Error(`Error creating trip: ${error.message}`);
    }
  }

  /**
   * Verify user is trip owner
   * @param {string} tripId - Trip ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} True if user is owner
   */
  async isOwner(tripId, userId) {
    try {
      const trip = await this.findById(tripId);
      return trip && trip.ownerId.toString() === userId;
    } catch (error) {
      throw new Error(`Error checking ownership: ${error.message}`);
    }
  }
}

module.exports = TripRepository;
