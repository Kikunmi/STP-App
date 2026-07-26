import { useQuery } from '@tanstack/react-query';
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
