import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoriteService } from '../api/services';
import { queryKeys } from '../lib/queryKeys';

export const useFavorites = () =>
  useQuery({
    queryKey: queryKeys.favorites.all,
    queryFn: favoriteService.getAll,
  });

export const useCreateFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => favoriteService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all }),
  });
};

export const useDeleteFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => favoriteService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all }),
  });
};
