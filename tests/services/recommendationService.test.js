const { expect } = require('chai');
const RecommendationService = require('../../src/services/RecommendationService');

describe('RecommendationService', () => {
  it('should generate ranked recommendation items in descending score order', () => {
    const result = RecommendationService.generateFromInput({
      destination: 'Paris',
      budget: 1500,
      preferences: ['food', 'photography']
    });

    expect(result.metadata.source).to.equal('rule-based');
    expect(result.recommendations).to.be.an('array').with.length.greaterThan(0);
    expect(result.recommendations.length).to.be.at.most(10);

    const scores = result.recommendations.map((item) => item.score);
    const sortedScores = [...scores].sort((a, b) => b - a);

    expect(scores).to.deep.equal(sortedScores);
    expect(new Set(result.recommendations.map((item) => item.title)).size).to.equal(result.recommendations.length);
  });

  it('should fall back to mid-range city recommendations when budget and dates are missing', () => {
    const result = RecommendationService.generateFromInput({
      destination: 'Unknown City'
    });

    expect(result.recommendations[0]).to.have.keys(
      'type',
      'title',
      'description',
      'estimatedCost',
      'reason',
      'score'
    );
    expect(result.recommendations.some((item) => item.title === 'Boutique Hotel in Unknown City')).to.equal(true);
  });

  it('should merge trip tags with request preferences for trip-based generation', () => {
    const result = RecommendationService.generateFromTrip({
      destination: 'Bali',
      budget: 2500,
      startDate: new Date('2030-06-01T00:00:00.000Z'),
      endDate: new Date('2030-06-08T00:00:00.000Z'),
      tags: ['food']
    }, ['spa']);

    expect(result.metadata.source).to.equal('trip-context');
    expect(result.recommendations.some((item) => item.title === 'Local Food & Market Tour')).to.equal(true);
    expect(result.recommendations.some((item) => item.title === 'Traditional Spa & Wellness Retreat')).to.equal(true);
  });
});
