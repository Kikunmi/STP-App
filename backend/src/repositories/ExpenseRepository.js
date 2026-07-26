const BaseRepository = require('./BaseRepository');
const Expense = require('../models/Expense');

/**
 * Expense Repository
 * Extends BaseRepository with expense-specific operations
 */
class ExpenseRepository extends BaseRepository {
  constructor() {
    super(Expense);
  }

  /**
   * Find expenses by trip with optional filters
   * @param {string} tripId - Trip ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Expense list
   */
  async findByTripId(tripId, options = {}) {
    try {
      const { category, fromDate, toDate } = options;
      const query = { tripId };

      if (category) {
        query.category = category;
      }

      if (fromDate || toDate) {
        query.date = {};
        if (fromDate) query.date.$gte = new Date(fromDate);
        if (toDate) query.date.$lte = new Date(toDate);
      }

      return await this.model.find(query).sort({ date: -1, createdAt: -1 });
    } catch (error) {
      throw new Error(`Error finding expenses by trip: ${error.message}`);
    }
  }

  /**
   * Summarize trip expenses by category and total
   * @param {string} tripId - Trip ID
   * @returns {Promise<Object>} Summary object
   */
  async getTripSummary(tripId) {
    try {
      const [totals] = await this.model.aggregate([
        { $match: { tripId: this.model.db.base.Types.ObjectId.createFromHexString(tripId) } },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { total: -1 } }
      ]);

      const expenses = await this.model.find({ tripId });
      const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);

      const byCategory = expenses.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.amount;
        return acc;
      }, {});

      return {
        totalAmount,
        count: expenses.length,
        byCategory,
        topCategory: totals ? totals._id : null
      };
    } catch (error) {
      throw new Error(`Error summarizing trip expenses: ${error.message}`);
    }
  }

  /**
   * Create expense item
   * @param {Object} expenseData - Expense payload
   * @returns {Promise<Object>} Created expense
   */
  async createExpense(expenseData) {
    try {
      return await this.create(expenseData);
    } catch (error) {
      throw new Error(`Error creating expense: ${error.message}`);
    }
  }
}

module.exports = ExpenseRepository;
