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

  // Flatten saved recommendation records into individual suggestion cards.
  const items = (data || []).flatMap((record) => {
    const list = record.recommendations || [];
    return list.map((item, i) => ({
      key: `${record._id || record.id}-${i}`,
      destination: record.destination,
      ...item,
    }));
  });

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Recommendations</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length ? (
          items.map((rec) => (
            <Card key={rec.key} className="flex flex-col gap-2">
              {rec.category && (
                <span className="badge bg-accent-50 text-accent-600 self-start capitalize">
                  {rec.category}
                </span>
              )}
              <h3 className="font-bold text-slate-900">{rec.title}</h3>
              {rec.description && <p className="text-sm text-slate-500">{rec.description}</p>}
              {rec.destination && (
                <span className="text-xs text-slate-400 mt-auto pt-2">📍 {rec.destination}</span>
              )}
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState
              title="No recommendations yet"
              subtitle="Generate recommendations from one of your trips to see ideas here."
            />
          </div>
        )}
      </div>
    </section>
  );
}
