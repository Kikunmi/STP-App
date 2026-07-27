import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseService } from '../api/services';
import { queryKeys } from '../lib/queryKeys';

export const useExpenses = (tripId) =>
  useQuery({
    queryKey: queryKeys.expenses.all(tripId),
    queryFn: () => expenseService.getAll(tripId),
    enabled: !!tripId,
  });

export const useCreateExpense = (tripId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => expenseService.create(tripId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all(tripId) }),
  });
};

export const useUpdateExpense = (tripId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ expenseId, payload }) => expenseService.update(expenseId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all(tripId) }),
  });
};

export const useDeleteExpense = (tripId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expenseId) => expenseService.remove(expenseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all(tripId) }),
  });
};
