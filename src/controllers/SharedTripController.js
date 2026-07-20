const TripRepository = require('../repositories/TripRepository');
const SharedTripRepository = require('../repositories/SharedTripRepository');
const UserRepository = require('../repositories/UserRepository');
const { asyncHandler } = require('../middleware/errorHandler');

const tripRepository = new TripRepository();
const sharedTripRepository = new SharedTripRepository();
const userRepository = new UserRepository();

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class SharedTripController {
  static resolveIdentifierType(identifier, identifierType) {
    if (identifierType) {
      return identifierType;
    }

    return emailPattern.test(identifier) ? 'email' : 'username';
  }

  static async getOwnedTrip(tripId, userId) {
    const trip = await tripRepository.findById(tripId);

    if (!trip) {
      return {
        error: {
          status: 404,
          body: {
            status: 'error',
            message: 'Trip not found',
            code: 'TRIP_NOT_FOUND'
          }
        }
      };
    }

    if (trip.ownerId.toString() !== userId) {
      return {
        error: {
          status: 403,
          body: {
            status: 'error',
            message: 'Only trip owner can manage shares',
            code: 'FORBIDDEN'
          }
        }
      };
    }

    return { trip };
  }

  static async findTargetUser(identifier, identifierType) {
    const normalizedIdentifier = identifier.trim();
    const resolvedType = SharedTripController.resolveIdentifierType(normalizedIdentifier, identifierType);

    if (resolvedType === 'email') {
      return userRepository.findByEmail(normalizedIdentifier.toLowerCase());
    }

    return userRepository.findByUsername(normalizedIdentifier);
  }

  static shareTrip = asyncHandler(async (req, res) => {
    const { tripId } = req.params;
    const { identifier, identifierType } = req.body;
    const userId = req.user.id;

    const { trip, error } = await SharedTripController.getOwnedTrip(tripId, userId);
    if (error) {
      return res.status(error.status).json(error.body);
    }

    const targetUser = await SharedTripController.findTargetUser(identifier, identifierType);

    if (!targetUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (targetUser._id.toString() === userId) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot share a trip with yourself',
        code: 'INVALID_SHARE_TARGET'
      });
    }

    const existingShare = await sharedTripRepository.findByTripAndSharedUser(tripId, targetUser._id);
    if (existingShare) {
      return res.status(409).json({
        status: 'error',
        message: 'Trip is already shared with this user',
        code: 'ALREADY_SHARED'
      });
    }

    try {
      const share = await sharedTripRepository.createShare({
        tripId,
        ownerId: userId,
        sharedUserId: targetUser._id
      });

      await tripRepository.findByIdAndUpdate(tripId, {
        $addToSet: { participants: targetUser._id }
      });

      return res.status(201).json({
        status: 'success',
        message: 'Trip shared successfully',
        data: {
          share,
          user: {
            _id: targetUser._id,
            username: targetUser.username,
            email: targetUser.email
          }
        }
      });
    } catch (repositoryError) {
      if (repositoryError.message.includes('E11000')) {
        return res.status(409).json({
          status: 'error',
          message: 'Trip is already shared with this user',
          code: 'ALREADY_SHARED'
        });
      }

      throw repositoryError;
    }
  });

  static listTripShares = asyncHandler(async (req, res) => {
    const { tripId } = req.params;
    const userId = req.user.id;

    const { error } = await SharedTripController.getOwnedTrip(tripId, userId);
    if (error) {
      return res.status(error.status).json(error.body);
    }

    const shares = await sharedTripRepository.findByTripId(tripId);

    res.status(200).json({
      status: 'success',
      data: {
        shares: shares.map(share => ({
          _id: share._id,
          tripId: share.tripId,
          ownerId: share.ownerId,
          sharedUser: share.sharedUserId,
          createdAt: share.createdAt,
          updatedAt: share.updatedAt
        })),
        count: shares.length
      }
    });
  });

  static unshareTrip = asyncHandler(async (req, res) => {
    const { tripId, sharedUserId } = req.params;
    const userId = req.user.id;

    const { trip, error } = await SharedTripController.getOwnedTrip(tripId, userId);
    if (error) {
      return res.status(error.status).json(error.body);
    }

    const deletedShare = await sharedTripRepository.deleteShareByTripAndUser(tripId, sharedUserId);

    if (!deletedShare) {
      return res.status(404).json({
        status: 'error',
        message: 'Share relation not found',
        code: 'SHARE_NOT_FOUND'
      });
    }

    if (sharedUserId !== trip.ownerId.toString()) {
      await tripRepository.findByIdAndUpdate(tripId, {
        $pull: { participants: sharedUserId }
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Trip unshared successfully',
      data: {}
    });
  });

  static listSharedTrips = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const sharedTrips = await sharedTripRepository.findTripsSharedWithUser(userId);

    const sharedTripData = sharedTrips
      .filter(sharedTrip => sharedTrip.tripId)
      .map(sharedTrip => ({
        shareId: sharedTrip._id,
        sharedAt: sharedTrip.createdAt,
        trip: {
          _id: sharedTrip.tripId._id,
          title: sharedTrip.tripId.title,
          destination: sharedTrip.tripId.destination,
          description: sharedTrip.tripId.description,
          startDate: sharedTrip.tripId.startDate,
          endDate: sharedTrip.tripId.endDate,
          budget: sharedTrip.tripId.budget,
          currency: sharedTrip.tripId.currency,
          status: sharedTrip.tripId.status
        },
        owner: sharedTrip.ownerId
      }));

    res.status(200).json({
      status: 'success',
      data: {
        sharedTrips: sharedTripData,
        count: sharedTripData.length
      }
    });
  });
}

module.exports = SharedTripController;
