import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recommendationService } from '../api/services';
import { queryKeys } from '../lib/queryKeys';

export const useRecommendations = () =>
  useQuery({
    queryKey: queryKeys.recommendations.all,
    queryFn: recommendationService.getAll,
  });

export const useTripRecommendations = (tripId) =>
  useQuery({
    queryKey: queryKeys.recommendations.forTrip(tripId),
    queryFn: () => recommendationService.getForTrip(tripId),
    enabled: !!tripId,
  });

export const useGenerateRecommendations = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => recommendationService.generate(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendations.all });
      if (variables?.tripId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.recommendations.forTrip(variables.tripId),
        });
      }
    },
  });
};
