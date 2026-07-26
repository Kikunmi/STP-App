const BaseRepository = require('./BaseRepository');
const Recommendation = require('../models/Recommendation');

/**
 * Recommendation Repository
 * Extends BaseRepository with recommendation-specific database operations
 */
class RecommendationRepository extends BaseRepository {
  constructor() {
    super(Recommendation);
  }

  /**
   * Create a new recommendation record
   * @param {Object} data - Recommendation data
   * @returns {Promise<Object>} Created recommendation
   */
  async createRecommendation(data) {
    try {
      return await this.create(data);
    } catch (error) {
      throw new Error(`Error creating recommendation: ${error.message}`);
    }
  }

  /**
   * Find recommendations by user ID with pagination
   * @param {string} userId - User ID
   * @param {Object} options - Query options (page, limit)
   * @returns {Promise<Object>} Paginated result
   */
  async findByUser(userId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;
      const query = { userId };

      const [recommendations, total] = await Promise.all([
        this.model
          .find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        this.model.countDocuments(query)
      ]);

      return {
        recommendations,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new Error(`Error finding recommendations by user: ${error.message}`);
    }
  }

  /**
   * Find recommendations by trip ID
   * @param {string} tripId - Trip ID
   * @param {string} userId - User ID (for ownership check)
   * @returns {Promise<Array>} Array of recommendations
   */
  async findByTrip(tripId, userId = null) {
    try {
      const query = { tripId };
      if (userId) {
        query.userId = userId;
      }

      return await this.model
        .find(query)
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error finding recommendations by trip: ${error.message}`);
    }
  }

  /**
   * Find recent recommendations for a user
   * @param {string} userId - User ID
   * @param {number} limit - Max number of results
   * @returns {Promise<Array>} Recent recommendations
   */
  async findRecent(userId, limit = 5) {
    try {
      return await this.model
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      throw new Error(`Error finding recent recommendations: ${error.message}`);
    }
  }
}

module.exports = RecommendationRepository;
