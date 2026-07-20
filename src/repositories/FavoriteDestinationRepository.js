const BaseRepository = require('./BaseRepository');
const FavoriteDestination = require('../models/FavoriteDestination');

/**
 * Favorite Destination Repository
 * Extends BaseRepository with favorite-destination-specific operations
 */
class FavoriteDestinationRepository extends BaseRepository {
  constructor() {
    super(FavoriteDestination);
  }

  /**
   * Find favorites by user with optional filters
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Favorites list
   */
  async findByUserId(userId, options = {}) {
    try {
      const { visited, country, tag } = options;
      const query = { userId };

      if (typeof visited !== 'undefined') {
        query.visited = visited === true || visited === 'true';
      }

      if (country) {
        query.country = country;
      }

      if (tag) {
        query.tags = { $in: [tag] };
      }

      return await this.model.find(query).sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error finding favorites by user: ${error.message}`);
    }
  }

  /**
   * Find one by user and id
   * @param {string} userId - User ID
   * @param {string} id - Favorite ID
   * @returns {Promise<Object|null>} Favorite or null
   */
  async findByUserAndId(userId, id) {
    try {
      return await this.model.findOne({ _id: id, userId });
    } catch (error) {
      throw new Error(`Error finding favorite by user and id: ${error.message}`);
    }
  }

  /**
   * Get favorites summary for user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Summary object
   */
  async getUserSummary(userId) {
    try {
      const favorites = await this.model.find({ userId });

      const summary = {
        total: favorites.length,
        visitedCount: favorites.filter((item) => item.visited).length,
        notVisitedCount: favorites.filter((item) => !item.visited).length,
        byCountry: {},
        topTags: {}
      };

      favorites.forEach((item) => {
        summary.byCountry[item.country] = (summary.byCountry[item.country] || 0) + 1;

        (item.tags || []).forEach((tag) => {
          summary.topTags[tag] = (summary.topTags[tag] || 0) + 1;
        });
      });

      return summary;
    } catch (error) {
      throw new Error(`Error getting favorites summary: ${error.message}`);
    }
  }

  /**
   * Create favorite destination
   * @param {Object} favoriteData - Favorite payload
   * @returns {Promise<Object>} Created favorite
   */
  async createFavorite(favoriteData) {
    try {
      return await this.create(favoriteData);
    } catch (error) {
      throw new Error(`Error creating favorite destination: ${error.message}`);
    }
  }
}

module.exports = FavoriteDestinationRepository;
