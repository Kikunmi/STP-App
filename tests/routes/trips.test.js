const { expect } = require('chai');
const request = require('supertest');
const { connectDB, disconnectDB } = require('../../src/config/database');
const app = require('../../app');
const { clearCollection, seedUser } = require('../../src/utils/database');
const AuthService = require('../../src/services/AuthService');

describe('Trip CRUD Routes', () => {
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
    
    testUser = await seedUser({
      username: 'tripuser',
      email: 'tripuser@example.com',
      passwordHash: 'SecurePass123'
    });
    userId = testUser._id.toString();
    authToken = AuthService.generateToken({
      id: userId,
      email: testUser.email,
      username: testUser.username
    });
  });

  describe('POST /api/trips', () => {
    it('should create a new trip with required fields', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(tomorrow);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Summer Vacation',
          destination: 'Paris',
          startDate: tomorrow.toISOString(),
          endDate: nextWeek.toISOString()
        });

      expect(response.status).to.equal(201);
      expect(response.body.status).to.equal('success');
      expect(response.body.data.trip).to.exist;
      expect(response.body.data.trip.title).to.equal('Summer Vacation');
      expect(response.body.data.trip.destination).to.equal('Paris');
      expect(response.body.data.trip.budget).to.equal(0);
      expect(response.body.data.trip.currency).to.equal('USD');
      expect(response.body.data.trip.status).to.equal('planned');
      tripId = response.body.data.trip._id;
    });

    it('should create trip with all optional fields', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(tomorrow);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Europe Tour',
          destination: 'Rome',
          startDate: tomorrow.toISOString(),
          endDate: nextWeek.toISOString(),
          budget: 5000,
          currency: 'EUR',
          description: 'Amazing European adventure',
          isPublic: true,
          tags: ['summer', 'europe', 'adventure']
        });

      expect(response.status).to.equal(201);
      expect(response.body.data.trip.budget).to.equal(5000);
      expect(response.body.data.trip.currency).to.equal('EUR');
      expect(response.body.data.trip.isPublic).to.be.true;
      expect(response.body.data.trip.tags).to.include('summer');
    });

    it('should reject trip with past start date', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Invalid Trip',
          destination: 'London',
          startDate: yesterday.toISOString(),
          endDate: tomorrow.toISOString()
        });

      expect(response.status).to.equal(400);
      expect(response.body.errors[0].field).to.equal('startDate');
    });

    it('should reject trip with end date before start date', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Invalid Trip',
          destination: 'Barcelona',
          startDate: dayAfterTomorrow.toISOString(),
          endDate: tomorrow.toISOString()
        });

      expect(response.status).to.equal(400);
      expect(response.body.errors[0].field).to.equal('endDate');
    });

    it('should reject trip with invalid title length', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(tomorrow);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'ab', // Too short
          destination: 'Tokyo',
          startDate: tomorrow.toISOString(),
          endDate: nextWeek.toISOString()
        });

      expect(response.status).to.equal(400);
      expect(response.body.errors[0].field).to.equal('title');
    });

    it('should reject trip without authentication', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(tomorrow);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const response = await request(app)
        .post('/api/trips')
        .send({
          title: 'Summer Vacation',
          destination: 'Paris',
          startDate: tomorrow.toISOString(),
          endDate: nextWeek.toISOString()
        });

      expect(response.status).to.equal(401);
    });
  });

  describe('GET /api/trips', () => {
    beforeEach(async () => {
      // Create test trips
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(tomorrow);
      nextWeek.setDate(nextWeek.getDate() + 7);

      for (let i = 1; i <= 15; i++) {
        await request(app)
          .post('/api/trips')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: `Trip ${i}`,
            destination: `Destination ${i}`,
            startDate: tomorrow.toISOString(),
            endDate: nextWeek.toISOString()
          });
      }
    });

    it('should get user trips with default pagination', async () => {
      const response = await request(app)
        .get('/api/trips')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.data.trips).to.be.an('array');
      expect(response.body.data.trips).to.have.lengthOf(10);
      expect(response.body.data.pagination.total).to.equal(15);
      expect(response.body.data.pagination.page).to.equal(1);
    });

    it('should support custom pagination', async () => {
      const response = await request(app)
        .get('/api/trips?page=2&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.data.trips).to.have.lengthOf(5);
      expect(response.body.data.pagination.page).to.equal(2);
      expect(response.body.data.pagination.pages).to.equal(3);
    });

    it('should filter trips by status', async () => {
      const response = await request(app)
        .get('/api/trips?status=planned')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      response.body.data.trips.forEach(trip => {
        expect(trip.status).to.equal('planned');
      });
    });

    it('should reject invalid pagination parameters', async () => {
      const response = await request(app)
        .get('/api/trips?page=0&limit=101')
        .set('Authorization', authHeader(authToken));

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal('error');
      expect(response.body.errors.map((error) => error.field)).to.include.members(['page', 'limit']);
    });
  });

  describe('GET /api/trips/:id', () => {
    let createdTripId;

    beforeEach(async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(tomorrow);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Trip',
          destination: 'Test Destination',
          startDate: tomorrow.toISOString(),
          endDate: nextWeek.toISOString()
        });

      createdTripId = response.body.data.trip._id;
    });

    it('should get trip by ID', async () => {
      const response = await request(app)
        .get(`/api/trips/${createdTripId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.data.trip._id).to.equal(createdTripId);
      expect(response.body.data.trip.title).to.equal('Test Trip');
    });

    it('should reject with invalid trip ID format', async () => {
      const response = await request(app)
        .get('/api/trips/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(400);
    });

    it('should return 404 for non-existent trip', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/trips/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(404);
      expect(response.body.code).to.equal('TRIP_NOT_FOUND');
    });

    it('should allow a participant to access a private trip', async () => {
      const participant = await seedUser({
        username: 'tripparticipant',
        email: 'tripparticipant@example.com',
        passwordHash: 'SecurePass123'
      });
      const participantToken = AuthService.generateToken({
        id: participant._id.toString(),
        email: participant.email,
        username: participant.username
      });

      await request(app)
        .post(`/api/trips/${createdTripId}/share`)
        .set('Authorization', authHeader(authToken))
        .send({ identifier: participant.username });

      const response = await request(app)
        .get(`/api/trips/${createdTripId}`)
        .set('Authorization', authHeader(participantToken));

      expect(response.status).to.equal(200);
      expect(response.body.data.trip._id).to.equal(createdTripId);
    });

    it('should allow any authenticated user to access a public trip', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(tomorrow);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const publicTripResponse = await request(app)
        .post('/api/trips')
        .set('Authorization', authHeader(authToken))
        .send({
          title: 'Public Trip',
          destination: 'Accra',
          startDate: tomorrow.toISOString(),
          endDate: nextWeek.toISOString(),
          isPublic: true
        });

      const stranger = await seedUser({
        username: 'tripstranger',
        email: 'tripstranger@example.com',
        passwordHash: 'SecurePass123'
      });
      const strangerToken = AuthService.generateToken({
        id: stranger._id.toString(),
        email: stranger.email,
        username: stranger.username
      });

      const response = await request(app)
        .get(`/api/trips/${publicTripResponse.body.data.trip._id}`)
        .set('Authorization', authHeader(strangerToken));

      expect(response.status).to.equal(200);
      expect(response.body.data.trip.isPublic).to.equal(true);
    });
  });

  describe('PUT /api/trips/:id', () => {
    let createdTripId;

    beforeEach(async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(tomorrow);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Original Title',
          destination: 'Original Destination',
          startDate: tomorrow.toISOString(),
          endDate: nextWeek.toISOString(),
          budget: 1000
        });

      createdTripId = response.body.data.trip._id;
    });

    it('should update trip with new data', async () => {
      const response = await request(app)
        .put(`/api/trips/${createdTripId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title',
          budget: 2000
        });

      expect(response.status).to.equal(200);
      expect(response.body.data.trip.title).to.equal('Updated Title');
      expect(response.body.data.trip.budget).to.equal(2000);
      expect(response.body.data.trip.destination).to.equal('Original Destination'); // unchanged
    });

    it('should update trip status', async () => {
      const response = await request(app)
        .put(`/api/trips/${createdTripId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'completed'
        });

      expect(response.status).to.equal(200);
      expect(response.body.data.trip.status).to.equal('completed');
    });

    it('should reject update from non-owner', async () => {
      // Create another user
      const otherUser = await seedUser({
        username: 'otheruser',
        email: 'other@example.com',
        passwordHash: 'SecurePass123'
      });
      const otherToken = AuthService.generateToken({
        id: otherUser._id.toString(),
        email: otherUser.email,
        username: otherUser.username
      });

      const response = await request(app)
        .put(`/api/trips/${createdTripId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Hacked Title' });

      expect(response.status).to.equal(403);
      expect(response.body.code).to.equal('FORBIDDEN');
    });

    it('should reject invalid dates', async () => {
      const response = await request(app)
        .put(`/api/trips/${createdTripId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          startDate: '2030-01-01T00:00:00Z',
          endDate: '2029-01-01T00:00:00Z' // Before start date
        });

      expect(response.status).to.equal(400);
    });

    it('should reject invalid trip ID format on update', async () => {
      const response = await request(app)
        .put('/api/trips/not-a-valid-id')
        .set('Authorization', authHeader(authToken))
        .send({ title: 'Invalid' });

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal('error');
      expect(response.body.errors[0].field).to.equal('id');
    });
  });

  describe('DELETE /api/trips/:id', () => {
    let createdTripId;

    beforeEach(async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(tomorrow);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Trip to Delete',
          destination: 'Delete Destination',
          startDate: tomorrow.toISOString(),
          endDate: nextWeek.toISOString()
        });

      createdTripId = response.body.data.trip._id;
    });

    it('should delete trip', async () => {
      const response = await request(app)
        .delete(`/api/trips/${createdTripId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.message).to.include('deleted');

      // Verify trip is deleted
      const getResponse = await request(app)
        .get(`/api/trips/${createdTripId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).to.equal(404);
    });

    it('should reject deletion from non-owner', async () => {
      const otherUser = await seedUser({
        username: 'otheruser2',
        email: 'other2@example.com',
        passwordHash: 'SecurePass123'
      });
      const otherToken = AuthService.generateToken({
        id: otherUser._id.toString(),
        email: otherUser.email,
        username: otherUser.username
      });

      const response = await request(app)
        .delete(`/api/trips/${createdTripId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).to.equal(403);
    });

    it('should reject invalid trip ID format on delete', async () => {
      const response = await request(app)
        .delete('/api/trips/not-a-valid-id')
        .set('Authorization', authHeader(authToken));

      expect(response.status).to.equal(400);
      expect(response.body.errors[0].field).to.equal('id');
    });
  });

  describe('GET /api/trips/filter/upcoming', () => {
    beforeEach(async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(tomorrow);
      nextWeek.setDate(nextWeek.getDate() + 7);

      await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Upcoming Trip',
          destination: 'Future Destination',
          startDate: tomorrow.toISOString(),
          endDate: nextWeek.toISOString()
        });
    });

    it('should get upcoming trips', async () => {
      const response = await request(app)
        .get('/api/trips/filter/upcoming')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.data.trips).to.be.an('array');
      expect(response.body.data.count).to.be.greaterThan(0);
    });
  });

  describe('GET /api/trips/search', () => {
    beforeEach(async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(tomorrow);
      nextWeek.setDate(nextWeek.getDate() + 7);

      await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Beach Vacation',
          destination: 'Hawaii',
          startDate: tomorrow.toISOString(),
          endDate: nextWeek.toISOString(),
          description: 'Relaxing beach getaway'
        });
    });

    it('should search trips by title', async () => {
      const response = await request(app)
        .get('/api/trips/search?q=Beach')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.data.trips).to.have.length.greaterThan(0);
      expect(response.body.data.trips[0].title).to.include('Beach');
    });

    it('should search trips by destination', async () => {
      const response = await request(app)
        .get('/api/trips/search?q=Hawaii')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.data.count).to.be.greaterThan(0);
    });

    it('should reject search query less than 2 characters', async () => {
      const response = await request(app)
        .get('/api/trips/search?q=a')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(400);
    });
  });
});
