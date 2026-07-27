import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  useItinerary,
  useCreateItineraryItem,
  useUpdateItineraryItem,
  useDeleteItineraryItem,
} from '../hooks/useItinerary';
import { Loading, ItineraryItem, Button, Input, EmptyState } from '../components/ui';

export default function Itinerary() {
  const { tripId } = useParams();
  const [title, setTitle] = useState('');
  const [activityDate, setActivityDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('09:00');

  const { data: items, isLoading, isError, error } = useItinerary(tripId);
  const createMutation = useCreateItineraryItem(tripId);
  const updateMutation = useUpdateItineraryItem(tripId);
  const deleteMutation = useDeleteItineraryItem(tripId);

  const handleAdd = async () => {
    if (!title || !activityDate || !time) return;
    await createMutation.mutateAsync({
      title,
      activityDate: new Date(activityDate).toISOString(),
      time,
    });
    setTitle('');
  };

  if (isLoading) return <Loading message="Loading itinerary..." />;
  if (isError) {
    return (
      <div className="text-[var(--color-danger)]">
        {error?.normalizedMessage || 'Failed to load itinerary'}
      </div>
    );
  }

  const list = Array.isArray(items) ? items : [];

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Itinerary</h1>

      <div className="card-base flex flex-col gap-3">
        <Input
          placeholder="Add an activity..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="date"
            className="sm:max-w-[12rem]"
            value={activityDate}
            onChange={(e) => setActivityDate(e.target.value)}
            aria-label="Activity date"
          />
          <Input
            type="time"
            className="sm:max-w-[8rem]"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            aria-label="Time"
          />
          <Button onClick={handleAdd} isLoading={createMutation.isPending} className="sm:ml-auto">
            {createMutation.isPending ? 'Adding...' : 'Add Activity'}
          </Button>
        </div>
        {createMutation.isError && (
          <div className="text-sm text-[var(--color-danger)]">
            {createMutation.error?.normalizedMessage || 'Failed to add activity'}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {list.length ? (
          list.map((item) => {
            const itemId = item.id || item._id;
            return (
              <ItineraryItem
                key={itemId}
                item={item}
                isSaving={updateMutation.isPending}
                onUpdate={(payload) => updateMutation.mutateAsync({ itemId, payload })}
                onDelete={() => deleteMutation.mutate(itemId)}
              />
            );
          })
        ) : (
          <EmptyState title="No itinerary items" subtitle="Plan your day by adding activities." />
        )}
      </div>
    </section>
  );
}
