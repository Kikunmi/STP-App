/**
 * Recommendation Service
 * Generates travel recommendations using rule-based heuristics derived from
 * destination context, user budget, travel dates, and preferences.
 */

// Destination profile keywords mapped to environment type
const DESTINATION_PROFILES = {
  beach: ['beach', 'island', 'coast', 'bay', 'sea', 'ocean', 'tropical', 'maldives', 'bali', 'cancun', 'miami', 'hawaii', 'phuket', 'boracay', 'ibiza', 'santorini', 'mykonos'],
  mountain: ['mountain', 'alps', 'himalaya', 'highland', 'summit', 'peak', 'ski', 'aspen', 'zermatt', 'chamonix', 'banff', 'queenstown', 'patagonia', 'nepal', 'colorado'],
  city: ['city', 'new york', 'london', 'paris', 'tokyo', 'dubai', 'singapore', 'sydney', 'berlin', 'rome', 'amsterdam', 'barcelona', 'bangkok', 'istanbul', 'chicago', 'seoul', 'hong kong', 'los angeles', 'toronto', 'nairobi', 'lagos', 'cairo', 'delhi', 'mumbai'],
  safari: ['safari', 'serengeti', 'kenya', 'tanzania', 'botswana', 'masai mara', 'kruger', 'africa', 'savanna', 'wildlife', 'namibia', 'zimbabwe', 'uganda', 'rwanda'],
  historical: ['rome', 'athens', 'cairo', 'jerusalem', 'istanbul', 'petra', 'machu picchu', 'mexico city', 'cusco', 'kyoto', 'agra', 'pompeii', 'luxor', 'angkor'],
  adventure: ['adventure', 'trekking', 'hiking', 'jungle', 'rainforest', 'amazon', 'costa rica', 'new zealand', 'patagonia', 'nepal', 'borneo', 'iceland'],
};

// Budget tier thresholds (in USD)
const BUDGET_TIERS = {
  budget: 500,
  midRange: 2000,
  luxury: Infinity
};

/**
 * Infer destination profile from destination string
 * @param {string} destination
 * @returns {string[]} matched profile types
 */
function inferDestinationProfiles(destination) {
  const lower = destination.toLowerCase();
  const matched = [];

  for (const [profile, keywords] of Object.entries(DESTINATION_PROFILES)) {
    if (keywords.some(kw => lower.includes(kw))) {
      matched.push(profile);
    }
  }

  return matched.length > 0 ? matched : ['city'];
}

/**
 * Determine budget tier
 * @param {number|null} budget
 * @returns {string}
 */
function getBudgetTier(budget) {
  if (!budget || budget <= 0) return 'midRange';
  if (budget <= BUDGET_TIERS.budget) return 'budget';
  if (budget <= BUDGET_TIERS.midRange) return 'midRange';
  return 'luxury';
}

/**
 * Calculate trip duration in days
 * @param {Date|null} start
 * @param {Date|null} end
 * @returns {number}
 */
function getTripDays(start, end) {
  if (!start || !end) return 7; // default assumption
  const diffMs = new Date(end) - new Date(start);
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 1;
}

/**
 * Build accommodation recommendations based on profile and budget
 */
function buildAccommodationRecs(profiles, budgetTier, destination) {
  const recs = [];

  if (budgetTier === 'luxury') {
    recs.push({
      type: 'accommodation',
      title: `Luxury Resort in ${destination}`,
      description: `5-star resort offering premium amenities, spa services, and stunning views. Ideal for travellers seeking an indulgent experience in ${destination}.`,
      estimatedCost: 400,
      reason: 'Recommended based on your high budget – premium accommodation elevates the trip experience.',
      score: 90
    });
  } else if (budgetTier === 'midRange') {
    recs.push({
      type: 'accommodation',
      title: `Boutique Hotel in ${destination}`,
      description: `A well-rated boutique hotel offering comfortable rooms, free breakfast, and central location in ${destination}.`,
      estimatedCost: 120,
      reason: 'Balances quality and affordability for mid-range travellers.',
      score: 80
    });
  } else {
    recs.push({
      type: 'accommodation',
      title: `Hostel or Guesthouse in ${destination}`,
      description: `Budget-friendly accommodation with social common areas – perfect for solo or backpacker travellers in ${destination}.`,
      estimatedCost: 30,
      reason: 'Recommended to keep accommodation costs low for budget trips.',
      score: 75
    });
  }

  if (profiles.includes('beach')) {
    recs.push({
      type: 'accommodation',
      title: `Beachfront Bungalow in ${destination}`,
      description: `Wake up to ocean views in a cosy beachfront bungalow. Best booked early during peak season.`,
      estimatedCost: budgetTier === 'luxury' ? 350 : budgetTier === 'midRange' ? 150 : 60,
      reason: 'Beachfront stays are highly popular for coastal destinations like ' + destination + '.',
      score: 85
    });
  }

  return recs;
}

/**
 * Build activity recommendations
 */
function buildActivityRecs(profiles, budgetTier, destination, preferences, tripDays) {
  const recs = [];

  if (profiles.includes('beach')) {
    recs.push({
      type: 'activity',
      title: 'Snorkelling or Scuba Diving',
      description: `Explore the underwater world of ${destination}. Guided tours are available for all skill levels.`,
      estimatedCost: budgetTier === 'budget' ? 30 : 80,
      reason: `${destination} is ideal for water sports given its coastal setting.`,
      score: 88
    });
    recs.push({
      type: 'activity',
      title: 'Sunset Boat Cruise',
      description: `A relaxing evening boat cruise along the coastline of ${destination} with light refreshments.`,
      estimatedCost: budgetTier === 'luxury' ? 120 : 45,
      reason: 'Sunset cruises are a classic highlight of beach destinations.',
      score: 82
    });
  }

  if (profiles.includes('mountain')) {
    recs.push({
      type: 'activity',
      title: 'Guided Hiking Trail',
      description: `Day hike along scenic mountain trails near ${destination}. Routes available for beginners and experienced hikers.`,
      estimatedCost: budgetTier === 'budget' ? 20 : 60,
      reason: 'Mountain destinations offer world-class hiking opportunities.',
      score: 90
    });
    recs.push({
      type: 'activity',
      title: 'Cable Car or Gondola Ride',
      description: `Take in breathtaking panoramic views of the ${destination} mountains via a cable car ride.`,
      estimatedCost: 40,
      reason: 'Cable car experiences provide unmatched views of mountainous terrain.',
      score: 83
    });
  }

  if (profiles.includes('safari')) {
    recs.push({
      type: 'activity',
      title: 'Morning Game Drive',
      description: `Join an expert-guided dawn game drive to spot the Big Five in their natural habitat around ${destination}.`,
      estimatedCost: budgetTier === 'luxury' ? 200 : 80,
      reason: 'Early morning drives offer the best wildlife sightings in safari destinations.',
      score: 95
    });
    recs.push({
      type: 'activity',
      title: 'Bush Walk with a Ranger',
      description: `An immersive on-foot safari experience through the bush guided by a certified ranger.`,
      estimatedCost: 60,
      reason: 'Walking safaris give a deeper connection with the natural environment.',
      score: 88
    });
  }

  if (profiles.includes('historical')) {
    recs.push({
      type: 'activity',
      title: 'Guided Historical Walking Tour',
      description: `Explore the ancient landmarks and heritage sites of ${destination} with a knowledgeable local guide.`,
      estimatedCost: 25,
      reason: 'Historical sites are the core attraction in this destination.',
      score: 87
    });
    recs.push({
      type: 'activity',
      title: 'Museum & Archaeological Site Visit',
      description: `Visit the renowned museums and archaeological treasures that make ${destination} a cultural gem.`,
      estimatedCost: 20,
      reason: 'Museums provide in-depth historical context about the destination.',
      score: 80
    });
  }

  if (profiles.includes('city')) {
    recs.push({
      type: 'activity',
      title: 'City Sightseeing Tour',
      description: `A half-day hop-on hop-off bus tour covering the major landmarks and neighbourhoods of ${destination}.`,
      estimatedCost: 35,
      reason: 'City tours are the most efficient way to explore urban highlights.',
      score: 80
    });
    if (tripDays >= 3) {
      recs.push({
        type: 'activity',
        title: 'Day Trip to Nearby Attractions',
        description: `Venture outside ${destination} to explore surrounding towns, natural parks, or cultural sites.`,
        estimatedCost: 70,
        reason: 'Day trips enrich multi-day city itineraries.',
        score: 75
      });
    }
  }

  if (profiles.includes('adventure')) {
    recs.push({
      type: 'activity',
      title: 'Multi-Day Trekking Expedition',
      description: `Join a guided multi-day trek through the rugged landscapes surrounding ${destination}.`,
      estimatedCost: budgetTier === 'luxury' ? 300 : 100,
      reason: 'Adventure destinations reward travellers with immersive outdoor expeditions.',
      score: 92
    });
  }

  // Preference-driven additions
  const prefLower = (preferences || []).map(p => p.toLowerCase());

  if (prefLower.some(p => ['food', 'culinary', 'foodie', 'cuisine'].includes(p))) {
    recs.push({
      type: 'activity',
      title: 'Local Food & Market Tour',
      description: `Sample authentic local dishes and street food on a guided culinary tour through the markets of ${destination}.`,
      estimatedCost: 40,
      reason: 'Selected based on your food preference – culinary experiences are central to this destination.',
      score: 88
    });
  }

  if (prefLower.some(p => ['photography', 'photo', 'camera'].includes(p))) {
    recs.push({
      type: 'activity',
      title: 'Photography Walking Tour',
      description: `Discover the most photogenic spots in ${destination} with a local photographer as your guide.`,
      estimatedCost: 50,
      reason: 'Tailored to photography enthusiasts seeking unique visual perspectives.',
      score: 85
    });
  }

  if (prefLower.some(p => ['spa', 'wellness', 'relax', 'relaxation'].includes(p))) {
    recs.push({
      type: 'activity',
      title: 'Traditional Spa & Wellness Retreat',
      description: `Relax with a traditional massage and wellness treatment at a top-rated spa in ${destination}.`,
      estimatedCost: budgetTier === 'luxury' ? 150 : 60,
      reason: 'Recommended based on your wellness preference.',
      score: 87
    });
  }

  if (prefLower.some(p => ['nightlife', 'bar', 'club', 'party'].includes(p))) {
    recs.push({
      type: 'activity',
      title: 'Nightlife & Entertainment Tour',
      description: `Experience the best bars, live music venues, and nightclubs ${destination} has to offer.`,
      estimatedCost: budgetTier === 'budget' ? 30 : 80,
      reason: 'Curated for travellers who enjoy vibrant evening entertainment.',
      score: 80
    });
  }

  return recs;
}

/**
 * Build restaurant recommendations
 */
function buildRestaurantRecs(profiles, budgetTier, destination) {
  const recs = [];

  if (budgetTier === 'luxury') {
    recs.push({
      type: 'restaurant',
      title: `Fine Dining Restaurant in ${destination}`,
      description: `Experience award-winning cuisine at one of ${destination}'s top fine-dining establishments. Reserve a table in advance.`,
      estimatedCost: 100,
      reason: 'Premium dining experiences align with your high-end travel budget.',
      score: 88
    });
  } else {
    recs.push({
      type: 'restaurant',
      title: `Local Street Food Experience in ${destination}`,
      description: `Try authentic street food stalls and local eateries for a genuine taste of ${destination}'s culinary culture.`,
      estimatedCost: budgetTier === 'budget' ? 10 : 25,
      reason: 'Street food is the most authentic and affordable culinary experience.',
      score: 85
    });
  }

  if (profiles.includes('beach') || profiles.includes('safari')) {
    recs.push({
      type: 'restaurant',
      title: 'Seafood or Bush Dinner Under the Stars',
      description: `A memorable outdoor dining experience featuring fresh local produce in ${destination}.`,
      estimatedCost: budgetTier === 'luxury' ? 80 : 35,
      reason: 'Alfresco dining is iconic in coastal and safari destinations.',
      score: 83
    });
  }

  recs.push({
    type: 'restaurant',
    title: `Rooftop or Viewpoint Café in ${destination}`,
    description: `Enjoy a meal or coffee with a panoramic view of ${destination}. Popular with visitors and locals alike.`,
    estimatedCost: budgetTier === 'budget' ? 15 : 40,
    reason: 'Viewpoint cafés offer a memorable ambiance while enjoying local food.',
    score: 79
  });

  return recs;
}

/**
 * Build transport recommendations
 */
function buildTransportRecs(profiles, budgetTier, destination, tripDays) {
  const recs = [];

  if (tripDays >= 5 && budgetTier !== 'budget') {
    recs.push({
      type: 'transport',
      title: `Rent a Car in ${destination}`,
      description: `Hiring a car gives you the flexibility to explore ${destination} and surrounding areas at your own pace.`,
      estimatedCost: 50,
      reason: 'Car rental is cost-effective for longer trips with multiple destinations.',
      score: 78
    });
  }

  if (profiles.includes('city')) {
    recs.push({
      type: 'transport',
      title: 'Airport Transfer & Public Transport Pass',
      description: `Pre-book an airport transfer and get a multi-day public transport pass to navigate ${destination} easily.`,
      estimatedCost: budgetTier === 'budget' ? 15 : 40,
      reason: 'Public transport is the most efficient way to travel within a city.',
      score: 77
    });
  }

  if (profiles.includes('beach') || profiles.includes('safari')) {
    recs.push({
      type: 'transport',
      title: 'Private Transfer Service',
      description: `Book private transfers between the airport, hotel, and key sites in ${destination} for seamless travel.`,
      estimatedCost: budgetTier === 'luxury' ? 80 : 35,
      reason: 'Private transfers are especially convenient in destinations with limited public transport.',
      score: 80
    });
  }

  return recs;
}

/**
 * Build attraction recommendations
 */
function buildAttractionRecs(profiles, budgetTier, destination) {
  const recs = [];

  if (profiles.includes('historical')) {
    recs.push({
      type: 'attraction',
      title: `UNESCO World Heritage Sites in ${destination}`,
      description: `${destination} is home to UNESCO-listed sites that represent remarkable cultural or natural significance. Not to be missed.`,
      estimatedCost: 20,
      reason: 'UNESCO sites are the signature attractions of historically rich destinations.',
      score: 92
    });
  }

  if (profiles.includes('city')) {
    recs.push({
      type: 'attraction',
      title: `Iconic Landmark of ${destination}`,
      description: `Visit the signature landmark that defines the skyline or cultural identity of ${destination}. Essential for first-time visitors.`,
      estimatedCost: 15,
      reason: 'Iconic landmarks are must-see attractions in any city.',
      score: 88
    });
  }

  if (profiles.includes('mountain') || profiles.includes('adventure')) {
    recs.push({
      type: 'attraction',
      title: `National Park Near ${destination}`,
      description: `Explore protected wilderness and natural wonders in the national parks surrounding ${destination}.`,
      estimatedCost: budgetTier === 'budget' ? 15 : 30,
      reason: 'National parks preserve the most spectacular landscapes in mountain and adventure regions.',
      score: 90
    });
  }

  recs.push({
    type: 'attraction',
    title: `Local Market or Bazaar in ${destination}`,
    description: `Browse handcrafted souvenirs, local art, and fresh produce at ${destination}'s most vibrant market.`,
    estimatedCost: 0,
    reason: 'Local markets offer an authentic cultural immersion at no entrance cost.',
    score: 76
  });

  return recs;
}

/**
 * Generate recommendations for a given context
 * @param {Object} context
 * @param {string} context.destination
 * @param {number|null} context.budget
 * @param {Date|null} context.startDate
 * @param {Date|null} context.endDate
 * @param {string[]} context.preferences
 * @returns {Object[]} Array of ranked recommendation items
 */
function generateRecommendationItems(context) {
  const { destination, budget = null, startDate = null, endDate = null, preferences = [] } = context;

  const profiles = inferDestinationProfiles(destination);
  const budgetTier = getBudgetTier(budget);
  const tripDays = getTripDays(startDate, endDate);

  const allRecs = [
    ...buildAccommodationRecs(profiles, budgetTier, destination),
    ...buildActivityRecs(profiles, budgetTier, destination, preferences, tripDays),
    ...buildRestaurantRecs(profiles, budgetTier, destination),
    ...buildTransportRecs(profiles, budgetTier, destination, tripDays),
    ...buildAttractionRecs(profiles, budgetTier, destination)
  ];

  // Deduplicate by title, sort descending by score, cap at 10
  const seen = new Set();
  const unique = allRecs.filter(rec => {
    if (seen.has(rec.title)) return false;
    seen.add(rec.title);
    return true;
  });

  return unique
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

class RecommendationService {
  /**
   * Generate recommendations from direct input
   * @param {Object} input
   * @param {string} input.destination
   * @param {number} [input.budget]
   * @param {string} [input.startDate]
   * @param {string} [input.endDate]
   * @param {string[]} [input.preferences]
   * @returns {Object} { recommendations, metadata }
   */
  static generateFromInput(input) {
    const { destination, budget, startDate, endDate, preferences = [] } = input;

    const items = generateRecommendationItems({
      destination,
      budget: budget || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      preferences
    });

    return {
      recommendations: items,
      metadata: {
        source: 'rule-based',
        generatedAt: new Date()
      }
    };
  }

  /**
   * Generate recommendations from trip context
   * @param {Object} trip - Populated trip document
   * @param {string[]} [preferences] - Additional preferences from request
   * @returns {Object} { recommendations, metadata }
   */
  static generateFromTrip(trip, preferences = []) {
    const mergedPreferences = [
      ...(trip.tags || []),
      ...preferences
    ];

    const items = generateRecommendationItems({
      destination: trip.destination,
      budget: trip.budget || null,
      startDate: trip.startDate,
      endDate: trip.endDate,
      preferences: mergedPreferences
    });

    return {
      recommendations: items,
      metadata: {
        source: 'trip-context',
        generatedAt: new Date()
      }
    };
  }
}

module.exports = RecommendationService;
