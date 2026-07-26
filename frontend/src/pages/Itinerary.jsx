import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useItinerary, useCreateItineraryItem } from '../hooks/useItinerary';
import { Loading, ItineraryItem, Button, Input, EmptyState } from '../components/ui';

export default function Itinerary() {
  const { tripId } = useParams();
  const [newTitle, setNewTitle] = useState('');

  const { data, isLoading, isError, error } = useItinerary(tripId);
  const createMutation = useCreateItineraryItem(tripId);

  const handleAdd = async () => {
    if (!newTitle) return;
    await createMutation.mutateAsync({ title: newTitle });
    setNewTitle('');
  };

  if (isLoading) return <Loading message="Loading itinerary..." />;
  if (isError) {
    return (
      <div className="text-[var(--color-danger)]">
        {error?.normalizedMessage || 'Failed to load itinerary'}
      </div>
    );
  }

  const items = data?.items || data || [];

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Itinerary</h1>

      <div className="flex gap-2 max-w-xl">
        <Input
          placeholder="Add an activity..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <Button onClick={handleAdd} disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Adding...' : 'Add'}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {items.length ? (
          items.map((item) => <ItineraryItem key={item.id || item._id} item={item} />)
        ) : (
          <EmptyState title="No itinerary items" subtitle="Plan your day by adding activities." />
        )}
      </div>
    </section>
  );
}
