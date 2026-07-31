const ExpenseRepository = require('../repositories/ExpenseRepository');
const TripRepository = require('../repositories/TripRepository');
const { asyncHandler } = require('../middleware/errorHandler');

const expenseRepository = new ExpenseRepository();
const tripRepository = new TripRepository();

class ExpenseController {
  static getTripExpenses = asyncHandler(async (req, res) => {
    const { tripId } = req.params;
    const { category, fromDate, toDate } = req.query;

    const expenses = await expenseRepository.findByTripId(tripId, { category, fromDate, toDate });

    res.status(200).json({
      status: 'success',
      data: {
        expenses,
        count: expenses.length
      }
    });
  });

  static getExpenseSummary = asyncHandler(async (req, res) => {
    const { tripId } = req.params;
    const summary = await expenseRepository.getTripSummary(tripId);

    res.status(200).json({ status: 'success', data: { summary } });
  });

  static createExpense = asyncHandler(async (req, res) => {
    const { tripId } = req.params;
    const userId = req.user.id;

    const trip = await tripRepository.findById(tripId);
    if (!trip) {
      return res.status(404).json({ status: 'error', message: 'Trip not found', code: 'TRIP_NOT_FOUND' });
    }

    if (trip.ownerId.toString() !== userId) {
      return res.status(403).json({ status: 'error', message: 'Forbidden', code: 'FORBIDDEN' });
    }

    const expenseDate = new Date(req.body.date);
    if (expenseDate < trip.startDate || expenseDate > trip.endDate) {
      return res.status(400).json({ status: 'error', message: 'Expense date is outside trip date range', code: 'INVALID_EXPENSE_DATE' });
    }

    const payload = {
      ...req.body,
      tripId
    };

    const expense = await expenseRepository.createExpense(payload);

    res.status(201).json({ status: 'success', data: { expense } });
  });

  static updateExpense = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const expense = await expenseRepository.findById(id);
    if (!expense) {
      return res.status(404).json({ status: 'error', message: 'Expense not found', code: 'EXPENSE_NOT_FOUND' });
    }

    const trip = await tripRepository.findById(expense.tripId.toString());
    if (!trip || trip.ownerId.toString() !== userId) {
      return res.status(403).json({ status: 'error', message: 'Forbidden', code: 'FORBIDDEN' });
    }

    const updated = await expenseRepository.findByIdAndUpdate(id, req.body);

    res.status(200).json({ status: 'success', data: { expense: updated } });
  });

  static deleteExpense = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const expense = await expenseRepository.findById(id);
    if (!expense) {
      return res.status(404).json({ status: 'error', message: 'Expense not found', code: 'EXPENSE_NOT_FOUND' });
    }

    const trip = await tripRepository.findById(expense.tripId.toString());
    if (!trip || trip.ownerId.toString() !== userId) {
      return res.status(403).json({ status: 'error', message: 'Forbidden', code: 'FORBIDDEN' });
    }

    await expenseRepository.findByIdAndDelete(id);

    res.status(200).json({ status: 'success', message: 'Expense deleted successfully' });
  });
}

module.exports = ExpenseController;
