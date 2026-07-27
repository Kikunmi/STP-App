/**
 * Centralized React Query keys.
 * Using factories keeps keys consistent across queries and invalidations.
 */
export const queryKeys = {
  auth: {
    profile: ['auth', 'profile'],
  },
  trips: {
    all: ['trips'],
    lists: () => [...queryKeys.trips.all, 'list'],
    upcoming: () => [...queryKeys.trips.all, 'upcoming'],
    detail: (id) => [...queryKeys.trips.all, 'detail', id],
  },
  itinerary: {
    all: (tripId) => ['itinerary', tripId],
  },
  expenses: {
    all: (tripId) => ['expenses', tripId],
  },
  favorites: {
    all: ['favorites'],
  },
  recommendations: {
    all: ['recommendations'],
    forTrip: (tripId) => ['recommendations', tripId],
  },
  sharing: {
    tripShares: (tripId) => ['shares', tripId],
    sharedWithMe: ['shared-with-me'],
  },
};

export default queryKeys;
