import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripService } from '../api/services';
import { queryKeys } from '../lib/queryKeys';

export const useTrips = () =>
  useQuery({
    queryKey: queryKeys.trips.lists(),
    queryFn: tripService.getAll,
  });

export const useUpcomingTrips = () =>
  useQuery({
    queryKey: queryKeys.trips.upcoming(),
    queryFn: tripService.getUpcoming,
  });

export const useTrip = (id) =>
  useQuery({
    queryKey: queryKeys.trips.detail(id),
    queryFn: () => tripService.getById(id),
    enabled: !!id,
  });

export const useCreateTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => tripService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.all });
    },
  });
};

export const useUpdateTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => tripService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.all });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.trips.detail(variables.id) });
      }
    },
  });
};

export const useDeleteTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => tripService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.all });
    },
  });
};
