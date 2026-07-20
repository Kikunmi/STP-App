const express = require('express');
const SharedTripController = require('../controllers/SharedTripController');
const { authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const {
  shareTripValidation,
  sharedTripIdValidation,
  unshareTripValidation
} = require('../validators/sharedTripValidators');

const router = express.Router();

router.post(
  '/trips/:tripId/share',
  authenticateToken,
  shareTripValidation,
  sharedTripIdValidation,
  handleValidationErrors,
  SharedTripController.shareTrip
);

router.get(
  '/trips/:tripId/shares',
  authenticateToken,
  sharedTripIdValidation,
  handleValidationErrors,
  SharedTripController.listTripShares
);

router.delete(
  '/trips/:tripId/share/:sharedUserId',
  authenticateToken,
  unshareTripValidation,
  handleValidationErrors,
  SharedTripController.unshareTrip
);

router.get(
  '/shared-trips',
  authenticateToken,
  SharedTripController.listSharedTrips
);

module.exports = router;
