const BaseRepository = require('./BaseRepository');
const Itinerary = require('../models/Itinerary');

/**
 * Itinerary Repository
 * Extends BaseRepository with itinerary-specific database operations
 */
class ItineraryRepository extends BaseRepository {
  constructor() {
    super(Itinerary);
  }

  /**
   * Find itineraries for a trip with optional filters
   * @param {string} tripId - Trip ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of itineraries
   */
  async findByTripId(tripId, options = {}) {
    try {
      const { status, priority } = options;
      const query = { tripId };

      if (status) {
        query.status = status;
      }

      if (priority) {
        query.priority = priority;
      }

      return await this.model
        .find(query)
        .sort({ activityDate: 1, time: 1 });
    } catch (error) {
      throw new Error(`Error finding itineraries by trip ID: ${error.message}`);
    }
  }

  /**
   * Search itinerary items by title, description, or location
   * @param {string} tripId - Trip ID
   * @param {string} searchQuery - Search query
   * @returns {Promise<Array>} Array of itineraries
   */
  async searchByTripId(tripId, searchQuery) {
    try {
      return await this.model
        .find({
          tripId,
          $or: [
            { title: new RegExp(searchQuery, 'i') },
            { description: new RegExp(searchQuery, 'i') },
            { location: new RegExp(searchQuery, 'i') }
          ]
        })
        .sort({ activityDate: 1, time: 1 })
        .limit(20);
    } catch (error) {
      throw new Error(`Error searching itineraries: ${error.message}`);
    }
  }

  /**
   * Create itinerary item
   * @param {Object} itineraryData - Itinerary data
   * @returns {Promise<Object>} Created itinerary
   */
  async createItinerary(itineraryData) {
    try {
      return await this.create(itineraryData);
    } catch (error) {
      throw new Error(`Error creating itinerary: ${error.message}`);
    }
  }
}

module.exports = ItineraryRepository;
