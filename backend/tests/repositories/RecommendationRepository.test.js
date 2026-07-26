const mongoose = require('mongoose');
const { expect } = require('chai');
const { connectDB, disconnectDB } = require('../../src/config/database');
const RecommendationRepository = require('../../src/repositories/RecommendationRepository');
const { clearCollection, seedUser } = require('../../src/utils/database');

describe('Recommendation Repository', () => {
  let recommendationRepository;
  let user;

  const buildRecommendation = (overrides = {}) => ({
    userId: user._id,
    tripId: new mongoose.Types.ObjectId(),
    destination: 'Paris',
    travelDates: {
      start: new Date('2030-01-01T00:00:00.000Z'),
      end: new Date('2030-01-05T00:00:00.000Z')
    },
    budget: 1500,
    preferences: ['food'],
    recommendations: [
      {
        type: 'activity',
        title: 'Local Food & Market Tour',
        description: 'Explore local markets.',
        estimatedCost: 40,
        reason: 'Matched from your food preferences.',
        score: 88
      }
    ],
    metadata: {
      source: 'rule-based',
      generatedAt: new Date()
    },
    ...overrides
  });

  before(async function () {
    this.timeout(10000);
    await connectDB();
    recommendationRepository = new RecommendationRepository();
  });

  after(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearCollection('users');
    await clearCollection('recommendations');
    user = await seedUser({
      username: 'recommendationrepo',
      email: 'recommendationrepo@example.com',
      passwordHash: 'SecurePass123'
    });
  });

  it('should persist a recommendation document', async () => {
    const recommendation = await recommendationRepository.createRecommendation(buildRecommendation());

    expect(recommendation._id).to.exist;
    expect(recommendation.destination).to.equal('Paris');
    expect(recommendation.recommendations).to.have.lengthOf(1);
  });

  it('should return trip-scoped recommendations for a user', async () => {
    const tripId = new mongoose.Types.ObjectId();
    await recommendationRepository.createRecommendation(buildRecommendation({ tripId, destination: 'Rome' }));
    await recommendationRepository.createRecommendation(buildRecommendation({ tripId: new mongoose.Types.ObjectId(), destination: 'Berlin' }));

    const recommendations = await recommendationRepository.findByTrip(tripId, user._id);

    expect(recommendations).to.have.lengthOf(1);
    expect(recommendations[0].destination).to.equal('Rome');
  });

  it('should paginate recommendations by user', async () => {
    await recommendationRepository.createRecommendation(buildRecommendation({ destination: 'Paris' }));
    await recommendationRepository.createRecommendation(buildRecommendation({ destination: 'Rome' }));

    const result = await recommendationRepository.findByUser(user._id, { page: 1, limit: 1 });

    expect(result.page).to.equal(1);
    expect(result.limit).to.equal(1);
    expect(result.total).to.equal(2);
    expect(result.recommendations).to.have.lengthOf(1);
  });
});
