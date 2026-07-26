import React from 'react';
import { Link } from 'react-router-dom';
import { useUpcomingTrips } from '../hooks/useTrips';
import { useAuth } from '../hooks/useAuth';
import { TripCard, Loading, EmptyState, Button } from '../components/ui';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: trips, isLoading, isError, error } = useUpcomingTrips();

  return (
    <section className="flex flex-col gap-8">
      <header className="relative overflow-hidden rounded-2xl bg-brand-gradient p-8 text-white shadow-glow">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-white/80 text-sm mb-1">Welcome back</p>
            <h1 className="text-3xl font-extrabold text-white">
              {user?.firstName || user?.username || 'Traveler'} 👋
            </h1>
            <p className="text-white/80 mt-1">Here's what's coming up.</p>
          </div>
          <Link to="/trips/new">
            <Button variant="secondary" size="lg">+ New Trip</Button>
          </Link>
        </div>
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute right-24 bottom-0 h-24 w-24 rounded-full bg-white/10" />
      </header>

      <div>
        <h2 className="text-lg font-bold mb-4">Upcoming Trips</h2>
        {isLoading && <Loading message="Loading upcoming trips..." />}
        {isError && (
          <div className="text-[var(--color-danger)]">
            {error?.normalizedMessage || 'Failed to load trips'}
          </div>
        )}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {trips?.length ? (
              trips.map((trip) => (
                <Link key={trip.id || trip._id} to={`/trips/${trip.id || trip._id}`}>
                  <TripCard trip={trip} />
                </Link>
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState
                  title="No upcoming trips"
                  subtitle="Create your first trip to get started."
                  action={
                    <Link to="/trips/new">
                      <Button>Plan a Trip</Button>
                    </Link>
                  }
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
