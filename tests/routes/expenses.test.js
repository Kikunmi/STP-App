const { expect } = require('chai');
const request = require('supertest');
const { connectDB, disconnectDB } = require('../../src/config/database');
const app = require('../../app');
const { clearCollection, seedUser } = require('../../src/utils/database');
const AuthService = require('../../src/services/AuthService');

describe('Expense CRUD Routes', () => {
  let authToken;
  let testUser;
  let tripId;
  const authHeader = (token) => 'B' + 'earer ' + token;

  before(async function () {
    this.timeout(10000);
    await connectDB();
  });

  after(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearCollection('users');
    await clearCollection('trips');
    await clearCollection('expenses');

    testUser = await seedUser({
      username: 'expenseowner',
      email: 'expenseowner@example.com',
      passwordHash: 'SecurePass123'
    });

    authToken = AuthService.generateToken({
      id: testUser._id.toString(),
      email: testUser.email,
      username: testUser.username
    });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 5);

    const tripResponse = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Expense Trip',
        destination: 'Lisbon',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

    tripId = tripResponse.body.data.trip._id;
  });

  describe('POST /api/trips/:tripId/expenses', () => {
    it('should create an expense for trip owner', async () => {
      const expenseDate = new Date();
      expenseDate.setDate(expenseDate.getDate() + 2);

      const response = await request(app)
        .post(`/api/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Hotel Booking',
          amount: 320,
          category: 'accommodation',
          date: expenseDate.toISOString(),
          notes: '2 nights',
          paymentMethod: 'card'
        });

      expect(response.status).to.equal(201);
      expect(response.body.status).to.equal('success');
      expect(response.body.data.expense.title).to.equal('Hotel Booking');
      expect(response.body.data.expense.amount).to.equal(320);
      expect(response.body.data.expense.category).to.equal('accommodation');
    });

    it('should reject expense outside trip date range', async () => {
      const invalidDate = new Date();
      invalidDate.setDate(invalidDate.getDate() + 20);

      const response = await request(app)
        .post(`/api/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Invalid Expense',
          amount: 50,
          date: invalidDate.toISOString()
        });

      expect(response.status).to.equal(400);
      expect(response.body.code).to.equal('INVALID_EXPENSE_DATE');
    });

    it('should reject creation by non-owner', async () => {
      const otherUser = await seedUser({
        username: 'expenseother',
        email: 'expenseother@example.com',
        passwordHash: 'SecurePass123'
      });

      const otherToken = AuthService.generateToken({
        id: otherUser._id.toString(),
        email: otherUser.email,
        username: otherUser.username
      });

      const expenseDate = new Date();
      expenseDate.setDate(expenseDate.getDate() + 2);

      const response = await request(app)
        .post(`/api/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          title: 'Unauthorized Expense',
          amount: 20,
          date: expenseDate.toISOString()
        });

      expect(response.status).to.equal(403);
      expect(response.body.code).to.equal('FORBIDDEN');
    });
  });

  describe('GET /api/trips/:tripId/expenses', () => {
    beforeEach(async () => {
      const day2 = new Date();
      day2.setDate(day2.getDate() + 2);

      const day3 = new Date();
      day3.setDate(day3.getDate() + 3);

      await request(app)
        .post(`/api/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Taxi',
          amount: 25,
          category: 'transport',
          date: day2.toISOString()
        });

      await request(app)
        .post(`/api/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Dinner',
          amount: 40,
          category: 'food',
          date: day3.toISOString()
        });
    });

    it('should list trip expenses', async () => {
      const response = await request(app)
        .get(`/api/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.data.expenses).to.have.lengthOf(2);
      expect(response.body.data.count).to.equal(2);
    });

    it('should filter expenses by category', async () => {
      const response = await request(app)
        .get(`/api/trips/${tripId}/expenses?category=food`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.data.expenses).to.have.lengthOf(1);
      expect(response.body.data.expenses[0].category).to.equal('food');
    });

    it('should reject invalid expense filters', async () => {
      const response = await request(app)
        .get(`/api/trips/${tripId}/expenses?category=invalid-category`)
        .set('Authorization', authHeader(authToken));

      expect(response.status).to.equal(400);
      expect(response.body.errors[0].field).to.equal('category');
    });
  });

  describe('PUT /api/expenses/:id', () => {
    let expenseId;

    beforeEach(async () => {
      const expenseDate = new Date();
      expenseDate.setDate(expenseDate.getDate() + 2);

      const createResponse = await request(app)
        .post(`/api/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Original Expense',
          amount: 60,
          category: 'activity',
          date: expenseDate.toISOString()
        });

      expenseId = createResponse.body.data.expense._id;
    });

    it('should update expense successfully', async () => {
      const response = await request(app)
        .put(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 75,
          notes: 'Updated amount and note',
          paymentMethod: 'cash'
        });

      expect(response.status).to.equal(200);
      expect(response.body.data.expense.amount).to.equal(75);
      expect(response.body.data.expense.notes).to.equal('Updated amount and note');
      expect(response.body.data.expense.paymentMethod).to.equal('cash');
    });

    it('should return 404 for non-existent expense', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .put(`/api/expenses/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 100 });

      expect(response.status).to.equal(404);
      expect(response.body.code).to.equal('EXPENSE_NOT_FOUND');
    });

    it('should reject update from non-owner', async () => {
      const otherUser = await seedUser({
        username: 'expenseeditor',
        email: 'expenseeditor@example.com',
        passwordHash: 'SecurePass123'
      });
      const otherToken = AuthService.generateToken({
        id: otherUser._id.toString(),
        email: otherUser.email,
        username: otherUser.username
      });

      const response = await request(app)
        .put(`/api/expenses/${expenseId}`)
        .set('Authorization', authHeader(otherToken))
        .send({ amount: 99 });

      expect(response.status).to.equal(403);
      expect(response.body.code).to.equal('FORBIDDEN');
    });
  });

  describe('DELETE /api/expenses/:id', () => {
    let expenseId;

    beforeEach(async () => {
      const expenseDate = new Date();
      expenseDate.setDate(expenseDate.getDate() + 2);

      const createResponse = await request(app)
        .post(`/api/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Delete Expense',
          amount: 20,
          date: expenseDate.toISOString()
        });

      expenseId = createResponse.body.data.expense._id;
    });

    it('should delete expense successfully', async () => {
      const response = await request(app)
        .delete(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.message).to.include('deleted');
    });

    it('should reject delete from non-owner', async () => {
      const otherUser = await seedUser({
        username: 'expensedeleter',
        email: 'expensedeleter@example.com',
        passwordHash: 'SecurePass123'
      });
      const otherToken = AuthService.generateToken({
        id: otherUser._id.toString(),
        email: otherUser.email,
        username: otherUser.username
      });

      const response = await request(app)
        .delete(`/api/expenses/${expenseId}`)
        .set('Authorization', authHeader(otherToken));

      expect(response.status).to.equal(403);
      expect(response.body.code).to.equal('FORBIDDEN');
    });

    it('should reject invalid expense ID format on delete', async () => {
      const response = await request(app)
        .delete('/api/expenses/not-a-valid-id')
        .set('Authorization', authHeader(authToken));

      expect(response.status).to.equal(400);
      expect(response.body.errors[0].field).to.equal('id');
    });
  });

  describe('GET /api/trips/:tripId/expenses/summary', () => {
    beforeEach(async () => {
      const day2 = new Date();
      day2.setDate(day2.getDate() + 2);
      const day3 = new Date();
      day3.setDate(day3.getDate() + 3);

      await request(app)
        .post(`/api/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Meal 1', amount: 30, category: 'food', date: day2.toISOString() });

      await request(app)
        .post(`/api/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Meal 2', amount: 20, category: 'food', date: day3.toISOString() });

      await request(app)
        .post(`/api/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Taxi', amount: 15, category: 'transport', date: day3.toISOString() });
    });

    it('should return expense summary with totals', async () => {
      const response = await request(app)
        .get(`/api/trips/${tripId}/expenses/summary`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.data.summary.totalAmount).to.equal(65);
      expect(response.body.data.summary.count).to.equal(3);
      expect(response.body.data.summary.byCategory.food).to.equal(50);
      expect(response.body.data.summary.byCategory.transport).to.equal(15);
    });
  });
});
