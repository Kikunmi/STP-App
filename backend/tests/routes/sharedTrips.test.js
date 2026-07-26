const { expect } = require('chai');
const request = require('supertest');
const { connectDB, disconnectDB } = require('../../src/config/database');
const app = require('../../app');
const { clearCollection, seedUser } = require('../../src/utils/database');
const AuthService = require('../../src/services/AuthService');
const Trip = require('../../src/models/Trip');

describe('Shared Trip Routes', () => {
  let owner;
  let ownerToken;
  let sharedUser;
  let sharedUserToken;
  let otherUser;
  let otherUserToken;
  let tripId;

  const authHeader = (token) => 'B' + 'earer ' + token;

  const createTrip = async (token, overrides = {}) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 5);

    const response = await request(app)
      .post('/api/trips')
      .set('Authorization', authHeader(token))
      .send({
        title: 'Shared Adventure',
        destination: 'Nairobi',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
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
    await clearCollection('shared_trips');

    owner = await seedUser({
      username: 'shareowner',
      email: 'shareowner@example.com',
      passwordHash: 'SecurePass123'
    });
    sharedUser = await seedUser({
      username: 'sharefriend',
      email: 'sharefriend@example.com',
      passwordHash: 'SecurePass123'
    });
    otherUser = await seedUser({
      username: 'shareother',
      email: 'shareother@example.com',
      passwordHash: 'SecurePass123'
    });

    ownerToken = AuthService.generateToken({
      id: owner._id.toString(),
      email: owner.email,
      username: owner.username
    });
    sharedUserToken = AuthService.generateToken({
      id: sharedUser._id.toString(),
      email: sharedUser.email,
      username: sharedUser.username
    });
    otherUserToken = AuthService.generateToken({
      id: otherUser._id.toString(),
      email: otherUser.email,
      username: otherUser.username
    });

    const trip = await createTrip(ownerToken);
    tripId = trip._id;
  });

  describe('POST /api/trips/:tripId/share', () => {
    it('should share a trip successfully by username', async () => {
      const response = await request(app)
        .post(`/api/trips/${tripId}/share`)
        .set('Authorization', authHeader(ownerToken))
        .send({
          identifier: sharedUser.username
        });

      expect(response.status).to.equal(201);
      expect(response.body.status).to.equal('success');
      expect(response.body.data.user.username).to.equal(sharedUser.username);
      expect(response.body.data.share.tripId).to.equal(tripId);

      const trip = await Trip.findById(tripId);
      expect(trip.participants.map(id => id.toString())).to.include(sharedUser._id.toString());
    });

    it('should share a trip successfully by email', async () => {
      const response = await request(app)
        .post(`/api/trips/${tripId}/share`)
        .set('Authorization', authHeader(ownerToken))
        .send({
          identifier: sharedUser.email.toUpperCase(),
          identifierType: 'email'
        });

      expect(response.status).to.equal(201);
      expect(response.body.data.user.email).to.equal(sharedUser.email);
    });

    it('should reject sharing with self', async () => {
      const response = await request(app)
        .post(`/api/trips/${tripId}/share`)
        .set('Authorization', authHeader(ownerToken))
        .send({
          identifier: owner.username
        });

      expect(response.status).to.equal(400);
      expect(response.body.code).to.equal('INVALID_SHARE_TARGET');
    });

    it('should reject sharing with non-existent user', async () => {
      const response = await request(app)
        .post(`/api/trips/${tripId}/share`)
        .set('Authorization', authHeader(ownerToken))
        .send({
          identifier: 'missing-user'
        });

      expect(response.status).to.equal(404);
      expect(response.body.code).to.equal('USER_NOT_FOUND');
    });

    it('should reject duplicate shares', async () => {
      await request(app)
        .post(`/api/trips/${tripId}/share`)
        .set('Authorization', authHeader(ownerToken))
        .send({
          identifier: sharedUser.username
        });

      const response = await request(app)
        .post(`/api/trips/${tripId}/share`)
        .set('Authorization', authHeader(ownerToken))
        .send({
          identifier: sharedUser.username
        });

      expect(response.status).to.equal(409);
      expect(response.body.code).to.equal('ALREADY_SHARED');
    });

    it('should enforce owner-only sharing', async () => {
      const response = await request(app)
        .post(`/api/trips/${tripId}/share`)
        .set('Authorization', authHeader(otherUserToken))
        .send({
          identifier: sharedUser.username
        });

      expect(response.status).to.equal(403);
      expect(response.body.code).to.equal('FORBIDDEN');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/trips/${tripId}/share`)
        .send({
          identifier: sharedUser.username
        });

      expect(response.status).to.equal(401);
      expect(response.body.code).to.equal('NO_TOKEN');
    });
  });

  describe('GET /api/trips/:tripId/shares', () => {
    beforeEach(async () => {
      await request(app)
        .post(`/api/trips/${tripId}/share`)
        .set('Authorization', authHeader(ownerToken))
        .send({
          identifier: sharedUser.username
        });
    });

    it('should list users shared on a trip', async () => {
      const response = await request(app)
        .get(`/api/trips/${tripId}/shares`)
        .set('Authorization', authHeader(ownerToken));

      expect(response.status).to.equal(200);
      expect(response.body.data.count).to.equal(1);
      expect(response.body.data.shares[0].sharedUser.username).to.equal(sharedUser.username);
    });

    it('should enforce owner-only share listing', async () => {
      const response = await request(app)
        .get(`/api/trips/${tripId}/shares`)
        .set('Authorization', authHeader(otherUserToken));

      expect(response.status).to.equal(403);
      expect(response.body.code).to.equal('FORBIDDEN');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/trips/${tripId}/shares`);

      expect(response.status).to.equal(401);
      expect(response.body.code).to.equal('NO_TOKEN');
    });
  });

  describe('DELETE /api/trips/:tripId/share/:sharedUserId', () => {
    beforeEach(async () => {
      await request(app)
        .post(`/api/trips/${tripId}/share`)
        .set('Authorization', authHeader(ownerToken))
        .send({
          identifier: sharedUser.username
        });
    });

    it('should unshare a trip successfully', async () => {
      const response = await request(app)
        .delete(`/api/trips/${tripId}/share/${sharedUser._id}`)
        .set('Authorization', authHeader(ownerToken));

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal('Trip unshared successfully');

      const trip = await Trip.findById(tripId);
      expect(trip.participants.map(id => id.toString())).to.not.include(sharedUser._id.toString());
      expect(trip.participants.map(id => id.toString())).to.include(owner._id.toString());
    });

    it('should return not found for missing relation', async () => {
      await request(app)
        .delete(`/api/trips/${tripId}/share/${sharedUser._id}`)
        .set('Authorization', authHeader(ownerToken));

      const response = await request(app)
        .delete(`/api/trips/${tripId}/share/${sharedUser._id}`)
        .set('Authorization', authHeader(ownerToken));

      expect(response.status).to.equal(404);
      expect(response.body.code).to.equal('SHARE_NOT_FOUND');
    });

    it('should enforce owner-only unshare', async () => {
      const response = await request(app)
        .delete(`/api/trips/${tripId}/share/${sharedUser._id}`)
        .set('Authorization', authHeader(otherUserToken));

      expect(response.status).to.equal(403);
      expect(response.body.code).to.equal('FORBIDDEN');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/trips/${tripId}/share/${sharedUser._id}`);

      expect(response.status).to.equal(401);
      expect(response.body.code).to.equal('NO_TOKEN');
    });
  });

  describe('GET /api/shared-trips', () => {
    beforeEach(async () => {
      await request(app)
        .post(`/api/trips/${tripId}/share`)
        .set('Authorization', authHeader(ownerToken))
        .send({
          identifier: sharedUser.email,
          identifierType: 'email'
        });
    });

    it('should list trips shared with the current user', async () => {
      const response = await request(app)
        .get('/api/shared-trips')
        .set('Authorization', authHeader(sharedUserToken));

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.data.count).to.equal(1);
      expect(response.body.data.sharedTrips[0].trip._id).to.equal(tripId);
      expect(response.body.data.sharedTrips[0].owner.username).to.equal(owner.username);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/shared-trips');

      expect(response.status).to.equal(401);
      expect(response.body.code).to.equal('NO_TOKEN');
    });
  });
});
