const ItineraryActivity = require('../models/Itinerary');
const Trip = require('../models/Trip');
const mongoose = require('mongoose');
const { AppError } = require('../utils/errorHandler');

class ItineraryService {
  /**
   * Get all activities for a trip
   */
  async getItinerary(tripId, sortBy = 'date') {
    // Verify trip exists
    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    // Build sort object
    const sortOptions = {
      date: { date: 1, time: 1 },
      time: { date: 1, time: 1 },
      priority: { priority: -1, date: 1 },
      type: { type: 1, date: 1 }
    };

    const sort = sortOptions[sortBy] || sortOptions.date;

    const activities = await ItineraryActivity.find({ tripId })
      .sort(sort)
      .lean();

    return activities;
  }

  /**
   * Get single activity by ID
   */
  async getActivity(activityId) {
    const activity = await ItineraryActivity.findById(activityId);
    if (!activity) {
      throw new AppError('Activity not found', 404);
    }
    return activity;
  }

  /**
   * Create new activity
   */
  async createActivity(tripId, activityData) {
    // Verify trip exists
    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    // Verify activity date is within trip dates
    const activityDate = new Date(activityData.date);
    if (activityDate < trip.startDate || activityDate > trip.endDate) {
      throw new AppError(
        `Activity date must be between ${trip.startDate.toDateString()} and ${trip.endDate.toDateString()}`,
        400
      );
    }

    const activity = new ItineraryActivity({
      tripId,
      ...activityData
    });

    await activity.save();
    return activity;
  }

  /**
   * Update activity
   */
  async updateActivity(activityId, updateData) {
    const activity = await ItineraryActivity.findById(activityId);
    if (!activity) {
      throw new AppError('Activity not found', 404);
    }

    // If date is being updated, verify it's within trip dates
    if (updateData.date) {
      const trip = await Trip.findById(activity.tripId);
      const newDate = new Date(updateData.date);

      if (newDate < trip.startDate || newDate > trip.endDate) {
        throw new AppError(
          `Activity date must be between ${trip.startDate.toDateString()} and ${trip.endDate.toDateString()}`,
          400
        );
      }
    }

    // Update fields
    Object.assign(activity, updateData);
    await activity.save();
    return activity;
  }

  /**
   * Delete activity
   */
  async deleteActivity(activityId) {
    const activity = await ItineraryActivity.findByIdAndDelete(activityId);
    if (!activity) {
      throw new AppError('Activity not found', 404);
    }
    return activity;
  }

  /**
   * Get activities by type
   */
  async getActivitiesByType(tripId, type) {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    const activities = await ItineraryActivity.find({
      tripId,
      type
    })
      .sort({ date: 1, time: 1 })
      .lean();

    return activities;
  }

  /**
   * Get activities for a specific date
   */
  async getActivitiesByDate(tripId, date) {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const activities = await ItineraryActivity.find({
      tripId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
      .sort({ time: 1 })
      .lean();

    return activities;
  }

  /**
   * Get high-priority activities
   */
  async getHighPriorityActivities(tripId) {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    const activities = await ItineraryActivity.find({
      tripId,
      priority: 'high'
    })
      .sort({ date: 1, time: 1 })
      .lean();

    return activities;
  }

  /**
   * Update activity status
   */
  async updateActivityStatus(activityId, status) {
    const validStatuses = ['planned', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const activity = await ItineraryActivity.findByIdAndUpdate(
      activityId,
      { status },
      { new: true, runValidators: true }
    );

    if (!activity) {
      throw new AppError('Activity not found', 404);
    }

    return activity;
  }

  /**
   * Calculate total cost for a trip's itinerary
   */
  async getTotalItineraryCost(tripId) {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    const result = await ItineraryActivity.aggregate([
      { $match: { tripId: mongoose.Types.ObjectId(tripId) } },
      { $group: { _id: null, totalCost: { $sum: '$cost' } } }
    ]);

    return result.length > 0 ? result[0].totalCost : 0;
  }

  /**
   * Get activity summary/stats for a trip
   */
  async getItinerarySummary(tripId) {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    const activities = await ItineraryActivity.find({ tripId }).lean();

    const summary = {
      totalActivities: activities.length,
      totalCost: activities.reduce((sum, a) => sum + (a.cost || 0), 0),
      byType: {},
      byPriority: {
        high: 0,
        medium: 0,
        low: 0
      },
      byStatus: {
        planned: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0
      }
    };

    activities.forEach(activity => {
      // By type
      if (!summary.byType[activity.type]) {
        summary.byType[activity.type] = 0;
      }
      summary.byType[activity.type]++;

      // By priority
      summary.byPriority[activity.priority]++;

      // By status
      summary.byStatus[activity.status]++;
    });

    return summary;
  }
}

module.exports = new ItineraryService();