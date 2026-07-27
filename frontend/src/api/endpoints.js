/**
 * Centralized API endpoint paths.
 * Keep all backend route strings here so they are easy to update in one place.
 */
export const ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    profile: '/api/auth/profile',
  },
  trips: {
    base: '/api/trips',
    upcoming: '/api/trips/filter/upcoming',
    byId: (id) => `/api/trips/${id}`,
  },
  itinerary: {
    base: (tripId) => `/api/trips/${tripId}/itinerary`,
    byId: (itemId) => `/api/itinerary/${itemId}`,
  },
  expenses: {
    base: (tripId) => `/api/trips/${tripId}/expenses`,
    byId: (expenseId) => `/api/expenses/${expenseId}`,
  },
  favorites: {
    base: '/api/favorite-destinations',
    byId: (id) => `/api/favorite-destinations/${id}`,
  },
  recommendations: {
    base: '/api/recommendations',
    generate: '/api/recommendations/generate',
    forTrip: (tripId) => `/api/trips/${tripId}/recommendations`,
  },
  sharing: {
    share: (tripId) => `/api/trips/${tripId}/share`,
    listShares: (tripId) => `/api/trips/${tripId}/shares`,
    unshare: (tripId, sharedUserId) => `/api/trips/${tripId}/share/${sharedUserId}`,
    sharedWithMe: '/api/shared-trips',
  },
};

export default ENDPOINTS;
