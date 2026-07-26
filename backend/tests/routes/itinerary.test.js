const { expect } = require('chai');
const request = require('supertest');
const { connectDB, disconnectDB } = require('../../src/config/database');
const app = require('../../app');
const { clearCollection, seedUser } = require('../../src/utils/database');
const AuthService = require('../../src/services/AuthService');

describe('Itinerary CRUD Routes', () => {
  let authToken;
  let userId;
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
    await clearCollection('itineraries');

    testUser = await seedUser({
      username: 'itineraryowner',
      email: 'itineraryowner@example.com',
      passwordHash: 'SecurePass123'
    });

    userId = testUser._id.toString();
    authToken = AuthService.generateToken({
      id: userId,
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
        title: 'Italy Adventure',
        destination: 'Rome',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

    tripId = tripResponse.body.data.trip._id;
  });

  describe('POST /api/trips/:tripId/itinerary', () => {
    it('should create itinerary item for valid trip and owner', async () => {
      const activityDate = new Date();
      activityDate.setDate(activityDate.getDate() + 2);

      const response = await request(app)
        .post(`/api/trips/${tripId}/itinerary`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Visit Colosseum',
          description: 'Morning guided tour',
          activityDate: activityDate.toISOString(),
          time: '09:30',
          location: 'Colosseum, Rome',
          estimatedCost: 50,
          priority: 'high'
        });

      expect(response.status).to.equal(201);
      expect(response.body.status).to.equal('success');
      expect(response.body.data.itinerary.title).to.equal('Visit Colosseum');
      expect(response.body.data.itinerary.status).to.equal('planned');
    });

    it('should reject create when activity date is outside trip range', async () => {
      const invalidDate = new Date();
      invalidDate.setDate(invalidDate.getDate() + 20);

      const response = await request(app)
        .post(`/api/trips/${tripId}/itinerary`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Invalid Date Activity',
          activityDate: invalidDate.toISOString(),
          time: '11:00'
        });

      expect(response.status).to.equal(400);
      expect(response.body.code).to.equal('INVALID_ACTIVITY_DATE');
    });

    it('should reject create by non-owner', async () => {
      const otherUser = await seedUser({
        username: 'otherituser',
        email: 'otherituser@example.com',
        passwordHash: 'SecurePass123'
      });

      const otherToken = AuthService.generateToken({
        id: otherUser._id.toString(),
        email: otherUser.email,
        username: otherUser.username
      });

      const activityDate = new Date();
      activityDate.setDate(activityDate.getDate() + 2);

      const response = await request(app)
        .post(`/api/trips/${tripId}/itinerary`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          title: 'Try to add activity',
          activityDate: activityDate.toISOString(),
          time: '10:00'
        });

      expect(response.status).to.equal(403);
      expect(response.body.code).to.equal('FORBIDDEN');
    });

    it('should reject invalid time format', async () => {
      const activityDate = new Date();
      activityDate.setDate(activityDate.getDate() + 2);

      const response = await request(app)
        .post(`/api/trips/${tripId}/itinerary`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Bad Time',
          activityDate: activityDate.toISOString(),
          time: '9:75'
        });

      expect(response.status).to.equal(400);
    });

    it('should reject invalid status value', async () => {
      const activityDate = new Date();
      activityDate.setDate(activityDate.getDate() + 2);

      const response = await request(app)
        .post(`/api/trips/${tripId}/itinerary`)
        .set('Authorization', authHeader(authToken))
        .send({
          title: 'Bad Status',
          activityDate: activityDate.toISOString(),
          time: '10:15',
          status: 'in-progress'
        });

      expect(response.status).to.equal(400);
      expect(response.body.errors[0].field).to.equal('status');
    });

    it('should reject create without authentication', async () => {
      const activityDate = new Date();
      activityDate.setDate(activityDate.getDate() + 2);

      const response = await request(app)
        .post(`/api/trips/${tripId}/itinerary`)
        .send({
          title: 'No Auth',
          activityDate: activityDate.toISOString(),
          time: '10:30'
        });

      expect(response.status).to.equal(401);
    });
  });

  describe('GET /api/trips/:tripId/itinerary', () => {
    beforeEach(async () => {
      const day2 = new Date();
      day2.setDate(day2.getDate() + 2);

      const day3 = new Date();
      day3.setDate(day3.getDate() + 3);

      await request(app)
        .post(`/api/trips/${tripId}/itinerary`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Museum Visit',
          description: 'History museum',
          activityDate: day3.toISOString(),
          time: '14:00',
          location: 'National Museum',
          priority: 'medium'
        });

      await request(app)
        .post(`/api/trips/${tripId}/itinerary`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Breakfast',
          description: 'Cafe stop',
          activityDate: day2.toISOString(),
          time: '08:00',
          location: 'City Cafe',
          priority: 'low'
        });
    });

    it('should list itinerary items sorted by date/time', async () => {
      const response = await request(app)
        .get(`/api/trips/${tripId}/itinerary`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.data.itineraries).to.have.lengthOf(2);
      expect(response.body.data.itineraries[0].title).to.equal('Breakfast');
      expect(response.body.data.itineraries[1].title).to.equal('Museum Visit');
    });

    it('should filter itinerary by priority', async () => {
      const response = await request(app)
        .get(`/api/trips/${tripId}/itinerary?priority=medium`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.data.itineraries).to.have.lengthOf(1);
      expect(response.body.data.itineraries[0].priority).to.equal('medium');
    });

    it('should filter itinerary by status', async () => {
      const updateResponse = await request(app)
        .get(`/api/trips/${tripId}/itinerary`)
        .set('Authorization', authHeader(authToken));
      const itineraryId = updateResponse.body.data.itineraries[0]._id;

      await request(app)
        .put(`/api/itinerary/${itineraryId}`)
        .set('Authorization', authHeader(authToken))
        .send({ status: 'completed' });

      const response = await request(app)
        .get(`/api/trips/${tripId}/itinerary?status=completed`)
        .set('Authorization', authHeader(authToken));

      expect(response.status).to.equal(200);
      expect(response.body.data.itineraries).to.have.lengthOf(1);
      expect(response.body.data.itineraries[0].status).to.equal('completed');
    });

    it('should search itinerary by query text', async () => {
      const response = await request(app)
        .get(`/api/trips/${tripId}/itinerary?q=Breakfast`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.data.itineraries).to.have.lengthOf(1);
      expect(response.body.data.itineraries[0].title).to.equal('Breakfast');
    });

    it('should reject itinerary access for unauthorized non-participant when trip is private', async () => {
      const otherUser = await seedUser({
        username: 'privateblocked',
        email: 'privateblocked@example.com',
        passwordHash: 'SecurePass123'
      });

      const otherToken = AuthService.generateToken({
        id: otherUser._id.toString(),
        email: otherUser.email,
        username: otherUser.username
      });

      const response = await request(app)
        .get(`/api/trips/${tripId}/itinerary`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).to.equal(403);
      expect(response.body.code).to.equal('FORBIDDEN');
    });

    it('should reject invalid itinerary filters', async () => {
      const response = await request(app)
        .get(`/api/trips/${tripId}/itinerary?priority=urgent`)
        .set('Authorization', authHeader(authToken));

      expect(response.status).to.equal(400);
      expect(response.body.errors[0].field).to.equal('priority');
    });
  });

  describe('PUT /api/itinerary/:id', () => {
    let itineraryId;

    beforeEach(async () => {
      const activityDate = new Date();
      activityDate.setDate(activityDate.getDate() + 2);

      const createResponse = await request(app)
        .post(`/api/trips/${tripId}/itinerary`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Original Activity',
          activityDate: activityDate.toISOString(),
          time: '10:00',
          location: 'Original Location'
        });

      itineraryId = createResponse.body.data.itinerary._id;
    });

    it('should update itinerary item successfully', async () => {
      const response = await request(app)
        .put(`/api/itinerary/${itineraryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Activity',
          location: 'Updated Location',
          status: 'completed'
        });

      expect(response.status).to.equal(200);
      expect(response.body.data.itinerary.title).to.equal('Updated Activity');
      expect(response.body.data.itinerary.location).to.equal('Updated Location');
      expect(response.body.data.itinerary.status).to.equal('completed');
    });

    it('should reject update with activity date outside trip range', async () => {
      const invalidDate = new Date();
      invalidDate.setDate(invalidDate.getDate() + 30);

      const response = await request(app)
        .put(`/api/itinerary/${itineraryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          activityDate: invalidDate.toISOString()
        });

      expect(response.status).to.equal(400);
      expect(response.body.code).to.equal('INVALID_ACTIVITY_DATE');
    });

    it('should reject update by non-owner', async () => {
      const otherUser = await seedUser({
        username: 'noupdateowner',
        email: 'noupdateowner@example.com',
        passwordHash: 'SecurePass123'
      });

      const otherToken = AuthService.generateToken({
        id: otherUser._id.toString(),
        email: otherUser.email,
        username: otherUser.username
      });

      const response = await request(app)
        .put(`/api/itinerary/${itineraryId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Illegal Update' });

      expect(response.status).to.equal(403);
    });

    it('should return 404 for non-existent itinerary update', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/itinerary/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Not Found' });

      expect(response.status).to.equal(404);
      expect(response.body.code).to.equal('ITINERARY_NOT_FOUND');
    });

    it('should reject invalid priority on update', async () => {
      const response = await request(app)
        .put(`/api/itinerary/${itineraryId}`)
        .set('Authorization', authHeader(authToken))
        .send({ priority: 'urgent' });

      expect(response.status).to.equal(400);
      expect(response.body.errors[0].field).to.equal('priority');
    });
  });

  describe('DELETE /api/itinerary/:id', () => {
    let itineraryId;

    beforeEach(async () => {
      const activityDate = new Date();
      activityDate.setDate(activityDate.getDate() + 2);

      const createResponse = await request(app)
        .post(`/api/trips/${tripId}/itinerary`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Delete Me',
          activityDate: activityDate.toISOString(),
          time: '12:00'
        });

      itineraryId = createResponse.body.data.itinerary._id;
    });

    it('should delete itinerary item successfully', async () => {
      const response = await request(app)
        .delete(`/api/itinerary/${itineraryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.message).to.include('deleted');
    });

    it('should reject delete by non-owner', async () => {
      const otherUser = await seedUser({
        username: 'nodeleteowner',
        email: 'nodeleteowner@example.com',
        passwordHash: 'SecurePass123'
      });

      const otherToken = AuthService.generateToken({
        id: otherUser._id.toString(),
        email: otherUser.email,
        username: otherUser.username
      });

      const response = await request(app)
        .delete(`/api/itinerary/${itineraryId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).to.equal(403);
      expect(response.body.code).to.equal('FORBIDDEN');
    });

    it('should return 404 for non-existent itinerary delete', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/itinerary/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(404);
      expect(response.body.code).to.equal('ITINERARY_NOT_FOUND');
    });
  });
});
