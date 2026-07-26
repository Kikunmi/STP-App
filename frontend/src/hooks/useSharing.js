import { useQuery, useMutation } from '@tanstack/react-query';
import { sharingService } from '../api/services';
import { queryKeys } from '../lib/queryKeys';

export const useSharedTrip = (shareId) =>
  useQuery({
    queryKey: queryKeys.sharing.shared(shareId),
    queryFn: () => sharingService.getSharedTrip(shareId),
    enabled: !!shareId,
  });

export const useCreateShareLink = () =>
  useMutation({
    mutationFn: (tripId) => sharingService.createShareLink(tripId),
  });

export const useRevokeShare = () =>
  useMutation({
    mutationFn: (shareId) => sharingService.revokeShare(shareId),
  });
