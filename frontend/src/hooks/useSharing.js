import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sharingService } from '../api/services';
import { queryKeys } from '../lib/queryKeys';

export const useTripShares = (tripId) =>
  useQuery({
    queryKey: queryKeys.sharing.tripShares(tripId),
    queryFn: () => sharingService.listShares(tripId),
    enabled: !!tripId,
  });

export const useSharedWithMe = () =>
  useQuery({
    queryKey: queryKeys.sharing.sharedWithMe,
    queryFn: sharingService.sharedWithMe,
  });

export const useShareTrip = (tripId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ identifier, identifierType }) =>
      sharingService.shareWithUser({ tripId, identifier, identifierType }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.sharing.tripShares(tripId) }),
  });
};

export const useUnshareTrip = (tripId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sharedUserId) => sharingService.unshare(tripId, sharedUserId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.sharing.tripShares(tripId) }),
  });
};
