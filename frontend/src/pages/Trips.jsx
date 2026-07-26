import React from 'react';
import { Link } from 'react-router-dom';
import { useTrips } from '../hooks/useTrips';
import { TripCard, Loading, EmptyState, Button } from '../components/ui';

export default function Trips() {
  const { data: trips, isLoading, isError, error } = useTrips();

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Trips</h1>
        <Link to="/trips/new">
          <Button>+ New Trip</Button>
        </Link>
      </header>

      {isLoading && <Loading message="Loading trips..." />}
      {isError && (
        <div className="text-[var(--color-danger)]">
          {error?.normalizedMessage || 'Failed to load trips'}
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trips?.length ? (
            trips.map((trip) => (
              <Link key={trip.id || trip._id} to={`/trips/${trip.id || trip._id}`}>
                <TripCard trip={trip} />
              </Link>
            ))
          ) : (
            <div className="col-span-full">
              <EmptyState title="No trips found" subtitle="Start planning your next adventure." />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
