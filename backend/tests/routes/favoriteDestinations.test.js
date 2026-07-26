const { expect } = require('chai');
const request = require('supertest');
const { connectDB, disconnectDB } = require('../../src/config/database');
const app = require('../../app');
const { clearCollection, seedUser } = require('../../src/utils/database');
const AuthService = require('../../src/services/AuthService');

describe('Favorite Destination Routes', () => {
  let authToken;
  let testUser;
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
    await clearCollection('favorite_destinations');

    testUser = await seedUser({
      username: 'favoriteuser',
      email: 'favoriteuser@example.com',
      passwordHash: 'SecurePass123'
    });

    authToken = AuthService.generateToken({
      id: testUser._id.toString(),
      email: testUser.email,
      username: testUser.username
    });
  });

  describe('POST /api/favorite-destinations', () => {
    it('should create favorite destination successfully', async () => {
      const response = await request(app)
        .post('/api/favorite-destinations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          destinationName: 'Santorini',
          country: 'Greece',
          city: 'Oia',
          notes: 'Sunset and caldera views',
          tags: ['island', 'romantic'],
          rating: 5,
          visited: false
        });

      expect(response.status).to.equal(201);
      expect(response.body.status).to.equal('success');
      expect(response.body.data.favorite.destinationName).to.equal('Santorini');
      expect(response.body.data.favorite.country).to.equal('Greece');
      expect(response.body.data.favorite.rating).to.equal(5);
    });

    it('should reject invalid payload', async () => {
      const response = await request(app)
        .post('/api/favorite-destinations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          destinationName: 'A',
          country: ''
        });

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal('error');
      expect(response.body.errors).to.be.an('array');
    });

    it('should reject invalid rating and tag payloads', async () => {
      const response = await request(app)
        .post('/api/favorite-destinations')
        .set('Authorization', authHeader(authToken))
        .send({
          destinationName: 'Cape Coast',
          country: 'Ghana',
          rating: 6,
          tags: ['beach', '']
        });

      expect(response.status).to.equal(400);
      expect(response.body.errors.map((error) => error.field)).to.include.members(['rating', 'tags[1]']);
    });
  });

  describe('GET /api/favorite-destinations', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/favorite-destinations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          destinationName: 'Kyoto',
          country: 'Japan',
          tags: ['culture'],
          visited: true
        });

      await request(app)
        .post('/api/favorite-destinations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          destinationName: 'Banff',
          country: 'Canada',
          tags: ['nature', 'mountains'],
          visited: false
        });
    });

    it('should list all user favorites', async () => {
      const response = await request(app)
        .get('/api/favorite-destinations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.data.favorites).to.have.lengthOf(2);
      expect(response.body.data.count).to.equal(2);
    });

    it('should filter by visited status', async () => {
      const response = await request(app)
        .get('/api/favorite-destinations?visited=true')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.data.favorites).to.have.lengthOf(1);
      expect(response.body.data.favorites[0].visited).to.equal(true);
    });

    it('should filter by country', async () => {
      const response = await request(app)
        .get('/api/favorite-destinations?country=Canada')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.data.favorites).to.have.lengthOf(1);
      expect(response.body.data.favorites[0].country).to.equal('Canada');
    });

    it('should filter by tag', async () => {
      const response = await request(app)
        .get('/api/favorite-destinations?tag=nature')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.data.favorites).to.have.lengthOf(1);
      expect(response.body.data.favorites[0].destinationName).to.equal('Banff');
    });

    it('should support combined favorite filters', async () => {
      const response = await request(app)
        .get('/api/favorite-destinations?visited=false&country=Canada&tag=nature')
        .set('Authorization', authHeader(authToken));

      expect(response.status).to.equal(200);
      expect(response.body.data.favorites).to.have.lengthOf(1);
      expect(response.body.data.favorites[0].destinationName).to.equal('Banff');
    });
  });

  describe('GET /api/favorite-destinations/:id', () => {
    let favoriteId;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/api/favorite-destinations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          destinationName: 'Cape Town',
          country: 'South Africa'
        });

      favoriteId = createResponse.body.data.favorite._id;
    });

    it('should fetch single favorite destination', async () => {
      const response = await request(app)
        .get(`/api/favorite-destinations/${favoriteId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.data.favorite._id).to.equal(favoriteId);
    });

    it('should return 404 for non-existent favorite destination', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/favorite-destinations/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(404);
      expect(response.body.code).to.equal('FAVORITE_DESTINATION_NOT_FOUND');
    });

    it('should reject access to another users favorite destination', async () => {
      const otherUser = await seedUser({
        username: 'favoriteviewer',
        email: 'favoriteviewer@example.com',
        passwordHash: 'SecurePass123'
      });
      const otherToken = AuthService.generateToken({
        id: otherUser._id.toString(),
        email: otherUser.email,
        username: otherUser.username
      });

      const response = await request(app)
        .get(`/api/favorite-destinations/${favoriteId}`)
        .set('Authorization', authHeader(otherToken));

      expect(response.status).to.equal(404);
      expect(response.body.code).to.equal('FAVORITE_DESTINATION_NOT_FOUND');
    });
  });

  describe('PUT /api/favorite-destinations/:id', () => {
    let favoriteId;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/api/favorite-destinations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          destinationName: 'Marrakech',
          country: 'Morocco',
          visited: false
        });

      favoriteId = createResponse.body.data.favorite._id;
    });

    it('should update favorite destination', async () => {
      const response = await request(app)
        .put(`/api/favorite-destinations/${favoriteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          visited: true,
          rating: 4,
          notes: 'Visited in spring'
        });

      expect(response.status).to.equal(200);
      expect(response.body.data.favorite.visited).to.equal(true);
      expect(response.body.data.favorite.rating).to.equal(4);
      expect(response.body.data.favorite.notes).to.equal('Visited in spring');
    });

    it('should reject invalid update payload', async () => {
      const response = await request(app)
        .put(`/api/favorite-destinations/${favoriteId}`)
        .set('Authorization', authHeader(authToken))
        .send({ rating: 0 });

      expect(response.status).to.equal(400);
      expect(response.body.errors[0].field).to.equal('rating');
    });

    it('should hide favorite destination updates from other users', async () => {
      const otherUser = await seedUser({
        username: 'favoriteeditor',
        email: 'favoriteeditor@example.com',
        passwordHash: 'SecurePass123'
      });
      const otherToken = AuthService.generateToken({
        id: otherUser._id.toString(),
        email: otherUser.email,
        username: otherUser.username
      });

      const response = await request(app)
        .put(`/api/favorite-destinations/${favoriteId}`)
        .set('Authorization', authHeader(otherToken))
        .send({ visited: true });

      expect(response.status).to.equal(404);
      expect(response.body.code).to.equal('FAVORITE_DESTINATION_NOT_FOUND');
    });
  });

  describe('DELETE /api/favorite-destinations/:id', () => {
    let favoriteId;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/api/favorite-destinations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          destinationName: 'Zanzibar',
          country: 'Tanzania'
        });

      favoriteId = createResponse.body.data.favorite._id;
    });

    it('should delete favorite destination', async () => {
      const response = await request(app)
        .delete(`/api/favorite-destinations/${favoriteId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.message).to.include('deleted');
    });

    it('should hide favorite destination deletes from other users', async () => {
      const otherUser = await seedUser({
        username: 'favoritedeleter',
        email: 'favoritedeleter@example.com',
        passwordHash: 'SecurePass123'
      });
      const otherToken = AuthService.generateToken({
        id: otherUser._id.toString(),
        email: otherUser.email,
        username: otherUser.username
      });

      const response = await request(app)
        .delete(`/api/favorite-destinations/${favoriteId}`)
        .set('Authorization', authHeader(otherToken));

      expect(response.status).to.equal(404);
      expect(response.body.code).to.equal('FAVORITE_DESTINATION_NOT_FOUND');
    });
  });

  describe('GET /api/favorite-destinations/summary', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/favorite-destinations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          destinationName: 'Prague',
          country: 'Czech Republic',
          tags: ['architecture'],
          visited: true
        });

      await request(app)
        .post('/api/favorite-destinations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          destinationName: 'Reykjavik',
          country: 'Iceland',
          tags: ['nature', 'northern-lights'],
          visited: false
        });
    });

    it('should return favorites summary', async () => {
      const response = await request(app)
        .get('/api/favorite-destinations/summary')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body.data.summary.total).to.equal(2);
      expect(response.body.data.summary.visitedCount).to.equal(1);
      expect(response.body.data.summary.notVisitedCount).to.equal(1);
      expect(response.body.data.summary.byCountry['Czech Republic']).to.equal(1);
      expect(response.body.data.summary.byCountry.Iceland).to.equal(1);
      expect(response.body.data.summary.topTags.nature).to.equal(1);
    });
  });
});
