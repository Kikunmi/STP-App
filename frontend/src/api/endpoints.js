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
    upcoming: '/api/trips/upcoming',
    byId: (id) => `/api/trips/${id}`,
  },
  itinerary: {
    base: (tripId) => `/api/trips/${tripId}/itinerary`,
    byId: (tripId, itemId) => `/api/trips/${tripId}/itinerary/${itemId}`,
    reorder: (tripId) => `/api/trips/${tripId}/itinerary/reorder`,
  },
  expenses: {
    base: (tripId) => `/api/trips/${tripId}/expenses`,
    byId: (tripId, expenseId) => `/api/trips/${tripId}/expenses/${expenseId}`,
  },
  favorites: {
    base: '/api/favorites',
    byId: (id) => `/api/favorites/${id}`,
  },
  recommendations: {
    base: '/api/recommendations',
    forTrip: (tripId) => `/api/trips/${tripId}/recommendations`,
  },
  sharing: {
    share: (tripId) => `/api/trips/${tripId}/share`,
    shared: (shareId) => `/api/share/${shareId}`,
  },
};

export default ENDPOINTS;
