const { expect } = require('chai');
const request = require('supertest');
const { connectDB, disconnectDB } = require('../../src/config/database');
const app = require('../../app');

describe('Route Not Found Handler', () => {
  before(async function () {
    this.timeout(10000);
    await connectDB();
  });

  after(async () => {
    await disconnectDB();
  });

  it('should return 404 for non-existent route', async () => {
    const response = await request(app)
      .get('/api/nonexistent');

    expect(response.status).to.equal(404);
    expect(response.body.status).to.equal('error');
    expect(response.body.message).to.include('Route not found');
    expect(response.body.path).to.equal('/api/nonexistent');
  });

  it('should return 404 with proper structure', async () => {
    const response = await request(app)
      .post('/api/invalid');

    expect(response.status).to.equal(404);
    expect(response.body).to.have.keys('status', 'message', 'path');
  });
});
