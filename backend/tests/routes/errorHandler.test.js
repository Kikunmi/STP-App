const express = require('express');
const { expect } = require('chai');
const request = require('supertest');
const { errorHandler, asyncHandler } = require('../../src/middleware/errorHandler');

describe('Global Error Handler', () => {
  const createApp = () => {
    const app = express();

    app.get('/sync-error', (req, res, next) => {
      const error = new Error('Synchronous route failure');
      error.status = 418;
      next(error);
    });

    app.get('/async-error', asyncHandler(async () => {
      const error = new Error('Async route failure');
      error.statusCode = 422;
      throw error;
    }));

    app.use(errorHandler);

    return app;
  };

  it('should return the unified error payload for synchronous errors', async () => {
    const response = await request(createApp()).get('/sync-error');

    expect(response.status).to.equal(418);
    expect(response.body).to.deep.equal({
      status: 'error',
      message: 'Synchronous route failure'
    });
  });

  it('should return the unified error payload for async errors', async () => {
    const response = await request(createApp()).get('/async-error');

    expect(response.status).to.equal(422);
    expect(response.body.status).to.equal('error');
    expect(response.body.message).to.equal('Async route failure');
    expect(response.body).to.not.have.property('error');
  });
});
