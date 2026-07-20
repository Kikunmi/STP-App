const TripRepository = require('../repositories/TripRepository');
const { asyncHandler } = require('../middleware/errorHandler');

const tripRepository = new TripRepository();

class TripController {
  /**
   * Create a new trip
   * POST /api/trips
   */
  static createTrip = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { title, destination, startDate, endDate, budget, currency, description, isPublic, tags } = req.body;

    const tripData = {
      ownerId: userId,
      title,
      destination,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      budget: budget || 0,
      currency: currency || 'USD',
      description: description || '',
      isPublic: isPublic || false,
      tags: tags || [],
      participants: [userId] // Owner is always a participant
    };

    const trip = await tripRepository.createTrip(tripData);

    res.status(201).json({
      status: 'success',
      data: { trip }
    });
  });

  /**
   * Get all trips for current user with pagination
   * GET /api/trips
   */
  static getUserTrips = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, sort = 'createdAt' } = req.query;

    const result = await tripRepository.findByOwnerId(userId, {
      page: parseInt(page, 10),
      limit: Math.min(parseInt(limit, 10), 100),
      sort,
      status
    });

    res.status(200).json({
      status: 'success',
      data: {
        trips: result.trips,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          pages: result.pages
        }
      }
    });
  });

  /**
   * Get a single trip by ID
   * GET /api/trips/:id
   */
  static getTripById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const trip = await tripRepository.findById(id);

    if (!trip) {
      return res.status(404).json({
        status: 'error',
        message: 'Trip not found',
        code: 'TRIP_NOT_FOUND'
      });
    }

    // Check if user is owner or trip is public
    const isOwner = trip.ownerId.toString() === userId;
    const isParticipant = trip.participants.some(p => p.toString() === userId);

    if (!isOwner && !isParticipant && !trip.isPublic) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied',
        code: 'FORBIDDEN'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { trip }
    });
  });

  /**
   * Update a trip
   * PUT /api/trips/:id
   */
  static updateTrip = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Verify user is trip owner
    const trip = await tripRepository.findById(id);
    if (!trip) {
      return res.status(404).json({
        status: 'error',
        message: 'Trip not found',
        code: 'TRIP_NOT_FOUND'
      });
    }

    if (trip.ownerId.toString() !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Only trip owner can update',
        code: 'FORBIDDEN'
      });
    }

    // Validate date relationship if both dates are provided
    if (updateData.startDate && updateData.endDate) {
      if (new Date(updateData.endDate) <= new Date(updateData.startDate)) {
        return res.status(400).json({
          status: 'error',
          message: 'End date must be after start date',
          code: 'INVALID_DATES'
        });
      }
    }

    // Update dates if provided
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    const updatedTrip = await tripRepository.findByIdAndUpdate(id, updateData);

    res.status(200).json({
      status: 'success',
      data: { trip: updatedTrip }
    });
  });

  /**
   * Delete a trip
   * DELETE /api/trips/:id
   */
  static deleteTrip = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify user is trip owner
    const trip = await tripRepository.findById(id);
    if (!trip) {
      return res.status(404).json({
        status: 'error',
        message: 'Trip not found',
        code: 'TRIP_NOT_FOUND'
      });
    }

    if (trip.ownerId.toString() !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Only trip owner can delete',
        code: 'FORBIDDEN'
      });
    }

    await sharedTripRepository.deleteMany({ tripId: id });
    await tripRepository.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'Trip deleted successfully',
      data: {}
    });
  });

  /**
   * Search trips
   * GET /api/trips/search?q=<query>
   */
  static searchTrips = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { q, searchPublic = 'false' } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query must be at least 2 characters',
        code: 'INVALID_QUERY'
      });
    }

    const options = {
      limit: 20
    };

    if (searchPublic === 'false') {
      options.ownerId = userId;
    }

    const trips = await tripRepository.searchTrips(q, options);

    res.status(200).json({
      status: 'success',
      data: {
        trips,
        count: trips.length
      }
    });
  });

  /**
   * Get upcoming trips
   * GET /api/trips/filter/upcoming
   */
  static getUpcomingTrips = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const trips = await tripRepository.findUpcoming(userId);

    res.status(200).json({
      status: 'success',
      data: {
        trips,
        count: trips.length
      }
    });
  });

  /**
   * Get active trips (currently happening)
   * GET /api/trips/filter/active
   */
  static getActiveTrips = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const trips = await tripRepository.findActive(userId);

    res.status(200).json({
      status: 'success',
      data: {
        trips,
        count: trips.length
      }
    });
  });
}

module.exports = TripController;
