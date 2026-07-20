const ItineraryRepository = require('../repositories/ItineraryRepository');
const TripRepository = require('../repositories/TripRepository');
const { asyncHandler } = require('../middleware/errorHandler');

const itineraryRepository = new ItineraryRepository();
const tripRepository = new TripRepository();

/**
 * Itinerary Management Controller
 * Handles itinerary CRUD operations
 */
class ItineraryController {
  /**
   * Create itinerary item for a trip (owner only)
   * POST /api/trips/:tripId/itinerary
   */
  static createItinerary = asyncHandler(async (req, res) => {
    const { tripId } = req.params;
    const userId = req.user.id;
    const { title, description, activityDate, time, location, estimatedCost, status, priority } = req.body;

    const trip = await tripRepository.findById(tripId);
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
        message: 'Only trip owner can create itinerary items',
        code: 'FORBIDDEN'
      });
    }

    const activityDateObj = new Date(activityDate);
    if (activityDateObj < trip.startDate || activityDateObj > trip.endDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Activity date must be within trip date range',
        code: 'INVALID_ACTIVITY_DATE'
      });
    }

    const itinerary = await itineraryRepository.createItinerary({
      tripId,
      title,
      description: description || '',
      activityDate: activityDateObj,
      time,
      location: location || '',
      estimatedCost: estimatedCost || 0,
      status: status || 'planned',
      priority: priority || 'medium'
    });

    res.status(201).json({
      status: 'success',
      data: { itinerary }
    });
  });

  /**
   * Get itineraries for a trip (owner/participant/public rules)
   * GET /api/trips/:tripId/itinerary
   */
  static getTripItinerary = asyncHandler(async (req, res) => {
    const { tripId } = req.params;
    const userId = req.user.id;
    const { status, priority, q } = req.query;

    const trip = await tripRepository.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        status: 'error',
        message: 'Trip not found',
        code: 'TRIP_NOT_FOUND'
      });
    }

    const isOwner = trip.ownerId.toString() === userId;
    const isParticipant = trip.participants.some((p) => p.toString() === userId);

    if (!isOwner && !isParticipant && !trip.isPublic) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied',
        code: 'FORBIDDEN'
      });
    }

    const itineraries = q
      ? await itineraryRepository.searchByTripId(tripId, q)
      : await itineraryRepository.findByTripId(tripId, { status, priority });

    res.status(200).json({
      status: 'success',
      data: {
        itineraries,
        count: itineraries.length
      }
    });
  });

  /**
   * Update itinerary item (owner only)
   * PUT /api/itinerary/:id
   */
  static updateItinerary = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const itinerary = await itineraryRepository.findById(id);
    if (!itinerary) {
      return res.status(404).json({
        status: 'error',
        message: 'Itinerary not found',
        code: 'ITINERARY_NOT_FOUND'
      });
    }

    const trip = await tripRepository.findById(itinerary.tripId);
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
        message: 'Only trip owner can update itinerary items',
        code: 'FORBIDDEN'
      });
    }

    if (req.body.activityDate) {
      const activityDateObj = new Date(req.body.activityDate);
      if (activityDateObj < trip.startDate || activityDateObj > trip.endDate) {
        return res.status(400).json({
          status: 'error',
          message: 'Activity date must be within trip date range',
          code: 'INVALID_ACTIVITY_DATE'
        });
      }
      req.body.activityDate = activityDateObj;
    }

    const updated = await itineraryRepository.findByIdAndUpdate(id, req.body);

    res.status(200).json({
      status: 'success',
      data: { itinerary: updated }
    });
  });

  /**
   * Delete itinerary item (owner only)
   * DELETE /api/itinerary/:id
   */
  static deleteItinerary = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const itinerary = await itineraryRepository.findById(id);
    if (!itinerary) {
      return res.status(404).json({
        status: 'error',
        message: 'Itinerary not found',
        code: 'ITINERARY_NOT_FOUND'
      });
    }

    const trip = await tripRepository.findById(itinerary.tripId);
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
        message: 'Only trip owner can delete itinerary items',
        code: 'FORBIDDEN'
      });
    }

    await itineraryRepository.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'Itinerary deleted successfully',
      data: {}
    });
  });
}

module.exports = ItineraryController;
