import React from 'react';
import { useRecommendations } from '../hooks/useRecommendations';
import { Card, Loading, EmptyState } from '../components/ui';

export default function Recommendations() {
  const { data, isLoading, isError, error } = useRecommendations();

  if (isLoading) return <Loading message="Loading recommendations..." />;
  if (isError) {
    return (
      <div className="text-[var(--color-danger)]">
        {error?.normalizedMessage || 'Failed to load recommendations'}
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Recommendations</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.length ? (
          data.map((rec) => (
            <Card key={rec.id || rec._id}>
              <h3 className="font-semibold">{rec.title}</h3>
              <p className="text-sm text-slate-600">{rec.description}</p>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState title="No recommendations yet" subtitle="Check back later for tailored ideas." />
          </div>
        )}
      </div>
    </section>
  );
}
