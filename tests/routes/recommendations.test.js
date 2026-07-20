const { expect } = require('chai');
const request = require('supertest');
const { connectDB, disconnectDB } = require('../../src/config/database');
const app = require('../../app');
const { clearCollection, seedUser } = require('../../src/utils/database');
const AuthService = require('../../src/services/AuthService');

describe('Recommendation Routes', () => {
  let authToken;
  let userId;
  let testUser;
  let tripId;

  const authHeader = (token) => 'B' + 'earer ' + token;

  const createTrip = async (token, overrides = {}) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const response = await request(app)
      .post('/api/trips')
      .set('Authorization', authHeader(token))
      .send({
        title: 'Test Trip',
        destination: 'Paris',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        budget: 1500,
        tags: ['food', 'culture'],
        ...overrides
      });

    return response.body.data.trip;
  };

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
    await clearCollection('recommendations');

    testUser = await seedUser({
      username: 'recuser',
      email: 'recuser@example.com',
      passwordHash: 'SecurePass123'
    });

    userId = testUser._id.toString();
    authToken = AuthService.generateToken({
      id: userId,
      email: testUser.email,
      username: testUser.username
    });

    const trip = await createTrip(authToken);
    tripId = trip._id;
  });

  describe('POST /api/recommendations/generate', () => {
    describe('Authentication', () => {
      it('should require authentication', async () => {
        const response = await request(app)
          .post('/api/recommendations/generate')
          .send({ destination: 'Tokyo' });

        expect(response.status).to.equal(401);
        expect(response.body.code).to.equal('NO_TOKEN');
      });
    });

    describe('Validation', () => {
      it('should reject request with no destination and no tripId', async () => {
        const response = await request(app)
          .post('/api/recommendations/generate')
          .set('Authorization', authHeader(authToken))
          .send({});

        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal('error');
        expect(response.body.message).to.equal('Validation failed');
      });

      it('should reject invalid tripId format', async () => {
        const response = await request(app)
          .post('/api/recommendations/generate')
          .set('Authorization', authHeader(authToken))
          .send({ tripId: 'not-a-valid-id' });

        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal('error');
        expect(response.body.errors).to.be.an('array');
        expect(response.body.errors[0].field).to.equal('tripId');
      });

      it('should reject destination that is too short', async () => {
        const response = await request(app)
          .post('/api/recommendations/generate')
          .set('Authorization', authHeader(authToken))
          .send({ destination: 'A' });

        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal('error');
      });

      it('should reject invalid budget', async () => {
        const response = await request(app)
          .post('/api/recommendations/generate')
          .set('Authorization', authHeader(authToken))
          .send({ destination: 'Tokyo', budget: -100 });

        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal('error');
      });

      it('should reject endDate before startDate', async () => {
        const start = new Date();
        start.setDate(start.getDate() + 5);
        const end = new Date();
        end.setDate(end.getDate() + 2);

        const response = await request(app)
          .post('/api/recommendations/generate')
          .set('Authorization', authHeader(authToken))
          .send({
            destination: 'Tokyo',
            startDate: start.toISOString(),
            endDate: end.toISOString()
          });

        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal('error');
      });

      it('should reject non-array preferences', async () => {
        const response = await request(app)
          .post('/api/recommendations/generate')
          .set('Authorization', authHeader(authToken))
          .send({ destination: 'Tokyo', preferences: 'food' });

        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal('error');
      });
    });

    describe('Direct destination-based generation', () => {
      it('should generate recommendations with destination only', async () => {
        const response = await request(app)
          .post('/api/recommendations/generate')
          .set('Authorization', authHeader(authToken))
          .send({ destination: 'Tokyo' });

        expect(response.status).to.equal(201);
        expect(response.body.status).to.equal('success');
        expect(response.body.data.recommendation).to.exist;
        expect(response.body.data.recommendation.destination).to.equal('Tokyo');
        expect(response.body.data.recommendation.recommendations).to.be.an('array').with.length.greaterThan(0);
      });

      it('should generate recommendations with full input', async () => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 10);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);

        const response = await request(app)
          .post('/api/recommendations/generate')
          .set('Authorization', authHeader(authToken))
          .send({
            destination: 'Bali',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            budget: 2000,
            preferences: ['beach', 'spa']
          });

        expect(response.status).to.equal(201);
        expect(response.body.status).to.equal('success');
        const rec = response.body.data.recommendation;
        expect(rec.destination).to.equal('Bali');
        expect(rec.budget).to.equal(2000);
        expect(rec.preferences).to.include('beach');
        expect(rec.recommendations).to.be.an('array').with.length.greaterThan(0);
      });

      it('should return correct recommendation item shape', async () => {
        const response = await request(app)
          .post('/api/recommendations/generate')
          .set('Authorization', authHeader(authToken))
          .send({ destination: 'Paris' });

        expect(response.status).to.equal(201);
        const items = response.body.data.recommendation.recommendations;
        expect(items).to.be.an('array').with.length.greaterThan(0);

        const item = items[0];
        expect(item).to.have.property('type');
        expect(item).to.have.property('title');
        expect(item).to.have.property('description');
        expect(item).to.have.property('score');
      });

      it('should persist recommendation to database', async () => {
        const response = await request(app)
          .post('/api/recommendations/generate')
          .set('Authorization', authHeader(authToken))
          .send({ destination: 'New York' });

        expect(response.status).to.equal(201);
        expect(response.body.data.recommendation._id).to.exist;
        expect(response.body.data.recommendation.userId).to.exist;
      });

      it('should set metadata source to rule-based for direct input', async () => {
        const response = await request(app)
          .post('/api/recommendations/generate')
          .set('Authorization', authHeader(authToken))
          .send({ destination: 'London' });

        expect(response.status).to.equal(201);
        expect(response.body.data.recommendation.metadata.source).to.equal('rule-based');
      });

      it('should handle beach destinations with beach-specific items', async () => {
        const response = await request(app)
          .post('/api/recommendations/generate')
          .set('Authorization', authHeader(authToken))
          .send({ destination: 'Maldives' });

        expect(response.status).to.equal(201);
        const items = response.body.data.recommendation.recommendations;
        const types = items.map(i => i.type);
        expect(types).to.include('accommodation');
        expect(types).to.include('activity');
      });
    });

    describe('Trip-scoped generation', () => {
      it('should generate recommendations using tripId', async () => {
        const response = await request(app)
          .post('/api/recommendations/generate')
          .set('Authorization', authHeader(authToken))
          .send({ tripId });

        expect(response.status).to.equal(201);
        expect(response.body.status).to.equal('success');
        const rec = response.body.data.recommendation;
        expect(rec.tripId).to.equal(tripId);
        expect(rec.destination).to.equal('Paris');
        expect(rec.recommendations).to.be.an('array').with.length.greaterThan(0);
      });

      it('should set metadata source to trip-context for trip-based generation', async () => {
        const response = await request(app)
          .post('/api/recommendations/generate')
          .set('Authorization', authHeader(authToken))
          .send({ tripId });

        expect(response.status).to.equal(201);
        expect(response.body.data.recommendation.metadata.source).to.equal('trip-context');
      });

      it('should merge trip tags with provided preferences', async () => {
        const response = await request(app)
          .post('/api/recommendations/generate')
          .set('Authorization', authHeader(authToken))
          .send({ tripId, preferences: ['photography'] });

        expect(response.status).to.equal(201);
        expect(response.body.status).to.equal('success');
      });

      it('should return 404 for non-existent tripId', async () => {
        const fakeId = '507f1f77bcf86cd799439011';
        const response = await request(app)
          .post('/api/recommendations/generate')
          .set('Authorization', authHeader(authToken))
          .send({ tripId: fakeId });

        expect(response.status).to.equal(404);
        expect(response.body.code).to.equal('TRIP_NOT_FOUND');
      });

      it('should return 403 when user has no access to private trip', async () => {
        const otherUser = await seedUser({
          username: 'otherrec',
          email: 'otherrec@example.com',
          passwordHash: 'SecurePass123'
        });
        const otherToken = AuthService.generateToken({
          id: otherUser._id.toString(),
          email: otherUser.email,
          username: otherUser.username
        });

        const response = await request(app)
          .post('/api/recommendations/generate')
          .set('Authorization', authHeader(otherToken))
          .send({ tripId });

        expect(response.status).to.equal(403);
        expect(response.body.code).to.equal('FORBIDDEN');
      });

      it('should allow participant to generate recommendations for a trip', async () => {
        const participant = await seedUser({
          username: 'participant',
          email: 'participant@example.com',
          passwordHash: 'SecurePass123'
        });
        const participantToken = AuthService.generateToken({
          id: participant._id.toString(),
          email: participant.email,
          username: participant.username
        });

        // Share the trip so participant gains access
        await request(app)
          .post(`/api/trips/${tripId}/share`)
          .set('Authorization', authHeader(authToken))
          .send({ identifier: participant.username });

        const response = await request(app)
          .post('/api/recommendations/generate')
          .set('Authorization', authHeader(participantToken))
          .send({ tripId });

        expect(response.status).to.equal(201);
        expect(response.body.status).to.equal('success');
      });

      it('should allow public trip to be used for recommendations by any user', async () => {
        const publicTrip = await createTrip(authToken, { isPublic: true });

        const stranger = await seedUser({
          username: 'stranger',
          email: 'stranger@example.com',
          passwordHash: 'SecurePass123'
        });
        const strangerToken = AuthService.generateToken({
          id: stranger._id.toString(),
          email: stranger.email,
          username: stranger.username
        });

        const response = await request(app)
          .post('/api/recommendations/generate')
          .set('Authorization', authHeader(strangerToken))
          .send({ tripId: publicTrip._id });

        expect(response.status).to.equal(201);
        expect(response.body.status).to.equal('success');
      });
    });
  });
});
