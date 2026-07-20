const FavoriteDestinationRepository = require('../repositories/FavoriteDestinationRepository');
const { asyncHandler } = require('../middleware/errorHandler');

const favoriteDestinationRepository = new FavoriteDestinationRepository();

/**
 * Favorite Destinations Controller
 * Handles personal favorite destinations CRUD and summary
 */
class FavoriteDestinationController {
  /**
   * Create favorite destination for authenticated user
   * POST /api/favorite-destinations
   */
  static createFavoriteDestination = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const payload = {
      userId,
      destinationName: req.body.destinationName,
      country: req.body.country,
      city: req.body.city || '',
      notes: req.body.notes || '',
      tags: req.body.tags || [],
      rating: typeof req.body.rating === 'number' ? req.body.rating : 3,
      visited: typeof req.body.visited === 'boolean' ? req.body.visited : false
    };

    const favorite = await favoriteDestinationRepository.createFavorite(payload);

    res.status(201).json({
      status: 'success',
      data: { favorite }
    });
  });

  /**
   * Get authenticated user's favorite destinations
   * GET /api/favorite-destinations
   */
  static getMyFavoriteDestinations = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { visited, country, tag } = req.query;

    const favorites = await favoriteDestinationRepository.findByUserId(userId, {
      visited,
      country,
      tag
    });

    res.status(200).json({
      status: 'success',
      data: {
        favorites,
        count: favorites.length
      }
    });
  });

  /**
   * Get one favorite destination by id (owner only)
   * GET /api/favorite-destinations/:id
   */
  static getFavoriteDestinationById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const favorite = await favoriteDestinationRepository.findByUserAndId(userId, id);

    if (!favorite) {
      return res.status(404).json({
        status: 'error',
        message: 'Favorite destination not found',
        code: 'FAVORITE_DESTINATION_NOT_FOUND'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { favorite }
    });
  });

  /**
   * Update favorite destination (owner only)
   * PUT /api/favorite-destinations/:id
   */
  static updateFavoriteDestination = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await favoriteDestinationRepository.findByUserAndId(userId, id);

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Favorite destination not found',
        code: 'FAVORITE_DESTINATION_NOT_FOUND'
      });
    }

    const updated = await favoriteDestinationRepository.findByIdAndUpdate(id, req.body);

    res.status(200).json({
      status: 'success',
      data: { favorite: updated }
    });
  });

  /**
   * Delete favorite destination (owner only)
   * DELETE /api/favorite-destinations/:id
   */
  static deleteFavoriteDestination = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await favoriteDestinationRepository.findByUserAndId(userId, id);

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Favorite destination not found',
        code: 'FAVORITE_DESTINATION_NOT_FOUND'
      });
    }

    await favoriteDestinationRepository.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'Favorite destination deleted successfully',
      data: {}
    });
  });

  /**
   * Get authenticated user's favorite destination summary
   * GET /api/favorite-destinations/summary
   */
  static getMyFavoriteDestinationSummary = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const summary = await favoriteDestinationRepository.getUserSummary(userId);

    res.status(200).json({
      status: 'success',
      data: { summary }
    });
  });
}

module.exports = FavoriteDestinationController;
