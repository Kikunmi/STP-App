import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useTrip, useCreateTrip, useUpdateTrip } from '../hooks/useTrips';
import { Input, Button, Loading } from '../components/ui';

const schema = z.object({
  title: z.string().min(2, { message: 'Title is too short' }),
  destination: z.string().min(2, { message: 'Destination is too short' }),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export default function TripForm() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!tripId;

  const { data: trip, isLoading } = useTrip(tripId);
  const createMutation = useCreateTrip();
  const updateMutation = useUpdateTrip();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (trip) {
      reset({
        title: trip.title,
        destination: trip.destination,
        startDate: trip.startDate?.slice(0, 10),
        endDate: trip.endDate?.slice(0, 10),
      });
    }
  }, [trip, reset]);

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;

  const onSubmit = async (values) => {
    if (isEdit) {
      await updateMutation.mutateAsync({ id: tripId, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    navigate('/trips');
  };

  if (isEdit && isLoading) return <Loading message="Loading trip..." />;

  return (
    <section className="max-w-lg">
      <h1 className="text-2xl font-bold mb-4">{isEdit ? 'Edit Trip' : 'New Trip'}</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Input id="title" label="Title" error={errors.title?.message} {...register('title')} />
        <Input
          id="destination"
          label="Destination"
          error={errors.destination?.message}
          {...register('destination')}
        />
        <Input id="startDate" label="Start Date" type="date" {...register('startDate')} />
        <Input id="endDate" label="End Date" type="date" {...register('endDate')} />

        <div className="flex gap-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/trips')}>
            Cancel
          </Button>
        </div>

        {mutationError && (
          <div className="text-sm text-[var(--color-danger)]">
            {mutationError.normalizedMessage || 'Failed to save trip'}
          </div>
        )}
      </form>
    </section>
  );
}
