const TripRepository = require('../repositories/TripRepository');
const SharedTripRepository = require('../repositories/SharedTripRepository');
const RecommendationRepository = require('../repositories/RecommendationRepository');
const RecommendationService = require('../services/RecommendationService');
const { asyncHandler } = require('../middleware/errorHandler');

const tripRepository = new TripRepository();
const sharedTripRepository = new SharedTripRepository();
const recommendationRepository = new RecommendationRepository();

class RecommendationController {
  /**
   * Generate recommendations
   * POST /api/recommendations/generate
   */
  static generateRecommendations = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { tripId, destination, startDate, endDate, budget, preferences } = req.body;

    let resolvedDestination;
    let travelDates = { start: null, end: null };
    let resolvedBudget = budget || null;
    let source = 'rule-based';
    let tripRef = null;

    if (tripId) {
      // Trip-scoped generation
      const trip = await tripRepository.findById(tripId);

      if (!trip) {
        return res.status(404).json({
          status: 'error',
          message: 'Trip not found',
          code: 'TRIP_NOT_FOUND'
        });
      }

      // Check access: owner, participant, or public trip
      const isOwner = trip.ownerId.toString() === userId;
      const isParticipant = trip.participants.some(p => p.toString() === userId);

      if (!isOwner && !isParticipant && !trip.isPublic) {
        // Also allow if trip is shared with user
        const sharedRelation = await sharedTripRepository.findByTripAndSharedUser(tripId, userId);
        if (!sharedRelation) {
          return res.status(403).json({
            status: 'error',
            message: 'You do not have access to this trip',
            code: 'FORBIDDEN'
          });
        }
      }

      const { recommendations, metadata } = RecommendationService.generateFromTrip(trip, preferences || []);

      resolvedDestination = trip.destination;
      travelDates = { start: trip.startDate || null, end: trip.endDate || null };
      resolvedBudget = trip.budget || resolvedBudget;
      source = metadata.source;
      tripRef = trip._id;

      const saved = await recommendationRepository.createRecommendation({
        userId,
        tripId: trip._id,
        destination: resolvedDestination,
        travelDates,
        budget: resolvedBudget,
        preferences: preferences || [],
        recommendations,
        metadata: { ...metadata, source }
      });

      return res.status(201).json({
        status: 'success',
        message: 'Recommendations generated successfully',
        data: {
          recommendation: saved
        }
      });
    }

    // Direct destination-based generation
    resolvedDestination = destination;
    travelDates = {
      start: startDate ? new Date(startDate) : null,
      end: endDate ? new Date(endDate) : null
    };

    const { recommendations, metadata } = RecommendationService.generateFromInput({
      destination: resolvedDestination,
      budget: resolvedBudget,
      startDate: startDate || null,
      endDate: endDate || null,
      preferences: preferences || []
    });

    const saved = await recommendationRepository.createRecommendation({
      userId,
      tripId: tripRef,
      destination: resolvedDestination,
      travelDates,
      budget: resolvedBudget,
      preferences: preferences || [],
      recommendations,
      metadata
    });

    return res.status(201).json({
      status: 'success',
      message: 'Recommendations generated successfully',
      data: {
        recommendation: saved
      }
    });
  });
}

module.exports = RecommendationController;
