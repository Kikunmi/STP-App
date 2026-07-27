import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTrip, useDeleteTrip } from '../hooks/useTrips';
import {
  useTripRecommendations,
  useGenerateRecommendations,
} from '../hooks/useRecommendations';
import { Loading, ConfirmDialog, Button, Card, EmptyState } from '../components/ui';

export default function TripDetails() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: trip, isLoading, isError, error } = useTrip(tripId);
  const deleteMutation = useDeleteTrip();

  const { data: recRecords, isLoading: recLoading } = useTripRecommendations(tripId);
  const generateMutation = useGenerateRecommendations();

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(tripId);
    navigate('/trips');
  };

  const handleGenerate = () => generateMutation.mutate({ tripId });

  if (isLoading) return <Loading message="Loading trip..." />;
  if (isError) {
    return (
      <div className="text-[var(--color-danger)]">
        {error?.normalizedMessage || 'Failed to load trip'}
      </div>
    );
  }

  // Flatten saved recommendation records into individual suggestion cards.
  const recItems = (recRecords || []).flatMap((record) =>
    (record.recommendations || []).map((item, i) => ({
      key: `${record._id || record.id}-${i}`,
      ...item,
    }))
  );

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{trip?.title}</h1>
          <p className="text-slate-600">{trip?.destination}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(`/trips/${tripId}/edit`)}>
            Edit
          </Button>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            Delete
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to={`/trips/${tripId}/itinerary`}>
          <Card hover className="text-center">Itinerary</Card>
        </Link>
        <Link to={`/trips/${tripId}/expenses`}>
          <Card hover className="text-center">Expenses</Card>
        </Link>
        <Link to={`/trips/${tripId}/share`}>
          <Card hover className="text-center">Share</Card>
        </Link>
      </div>

      {/* Recommendations */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Recommendations</h2>
          <Button
            onClick={handleGenerate}
            isLoading={generateMutation.isPending}
            size="sm"
          >
            {generateMutation.isPending ? 'Generating...' : '✨ Generate Recommendations'}
          </Button>
        </div>

        {generateMutation.isError && (
          <div className="text-sm text-[var(--color-danger)]">
            {generateMutation.error?.normalizedMessage || 'Failed to generate recommendations'}
          </div>
        )}

        {recLoading ? (
          <Loading message="Loading recommendations..." />
        ) : recItems.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recItems.map((rec) => (
              <Card key={rec.key} className="flex flex-col gap-2">
                {rec.category && (
                  <span className="badge bg-accent-50 text-accent-600 self-start capitalize">
                    {rec.category}
                  </span>
                )}
                <h3 className="font-bold text-slate-900">{rec.title}</h3>
                {rec.description && <p className="text-sm text-slate-500">{rec.description}</p>}
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No recommendations yet"
            subtitle="Click “Generate Recommendations” to get tailored ideas for this trip."
          />
        )}
      </div>

      {confirmOpen && (
        <ConfirmDialog
          title="Delete this trip?"
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
        />
      )}

      {deleteMutation.isError && (
        <div className="text-[var(--color-danger)]">Failed to delete trip.</div>
      )}
    </section>
  );
}
