import React from 'react';
import { Link } from 'react-router-dom';
import { useSharedWithMe } from '../hooks/useSharing';
import { Card, Loading, EmptyState } from '../components/ui';

export default function SharedView() {
  const { data: shared, isLoading, isError, error } = useSharedWithMe();

  if (isLoading) return <Loading message="Loading shared trips..." />;
  if (isError) {
    return (
      <div className="text-[var(--color-danger)]">
        {error?.normalizedMessage || 'Failed to load shared trips'}
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Shared With Me</h1>
      {shared?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shared.map((entry) => (
            <Link key={entry.shareId} to={`/trips/${entry.trip._id}`}>
              <Card hover className="flex flex-col gap-1">
                <h3 className="font-bold text-slate-900">{entry.trip.title}</h3>
                <p className="text-sm text-slate-500">{entry.trip.destination}</p>
                {entry.owner?.username && (
                  <span className="text-xs text-slate-400 mt-2">
                    Shared by {entry.owner.username}
                  </span>
                )}
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No trips shared with you"
          subtitle="When someone shares a trip with you, it will appear here."
        />
      )}
    </section>
  );
}
