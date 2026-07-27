import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itineraryService } from '../api/services';
import { queryKeys } from '../lib/queryKeys';

export const useItinerary = (tripId) =>
  useQuery({
    queryKey: queryKeys.itinerary.all(tripId),
    queryFn: () => itineraryService.getAll(tripId),
    enabled: !!tripId,
  });

export const useCreateItineraryItem = (tripId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => itineraryService.create(tripId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.itinerary.all(tripId) }),
  });
};

export const useUpdateItineraryItem = (tripId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, payload }) => itineraryService.update(itemId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.itinerary.all(tripId) }),
  });
};

export const useDeleteItineraryItem = (tripId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId) => itineraryService.remove(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.itinerary.all(tripId) }),
  });
};
