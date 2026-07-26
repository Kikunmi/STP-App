import React from 'react';
import { useParams } from 'react-router-dom';
import { useSharedTrip } from '../hooks/useSharing';
import { Card, Loading } from '../components/ui';

export default function SharedView() {
  const { shareId } = useParams();
  const { data, isLoading, isError, error } = useSharedTrip(shareId);

  if (isLoading) return <Loading message="Loading shared trip..." />;
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-[var(--color-danger)]">
          {error?.normalizedMessage || 'Failed to load shared trip'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-bg p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl flex flex-col gap-4">
        <h1 className="text-3xl font-bold gradient-text">{data?.title}</h1>
        <Card>
          <p className="text-slate-600">{data?.destination}</p>
          {data?.description && <p className="mt-2">{data.description}</p>}
        </Card>
      </div>
    </div>
  );
}
