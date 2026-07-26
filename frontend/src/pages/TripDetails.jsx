import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTrip, useDeleteTrip } from '../hooks/useTrips';
import { Loading, ConfirmDialog, Button, Card } from '../components/ui';

export default function TripDetails() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: trip, isLoading, isError, error } = useTrip(tripId);
  const deleteMutation = useDeleteTrip();

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(tripId);
    navigate('/trips');
  };

  if (isLoading) return <Loading message="Loading trip..." />;
  if (isError) {
    return (
      <div className="text-[var(--color-danger)]">
        {error?.normalizedMessage || 'Failed to load trip'}
      </div>
    );
  }

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
          <Card className="hover:shadow-2xl transition-shadow text-center">Itinerary</Card>
        </Link>
        <Link to={`/trips/${tripId}/expenses`}>
          <Card className="hover:shadow-2xl transition-shadow text-center">Expenses</Card>
        </Link>
        <Link to={`/trips/${tripId}/share`}>
          <Card className="hover:shadow-2xl transition-shadow text-center">Share</Card>
        </Link>
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
