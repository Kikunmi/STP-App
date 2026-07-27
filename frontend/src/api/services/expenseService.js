import api from '../client';
import { ENDPOINTS } from '../endpoints';

export const expenseService = {
  async getAll(tripId) {
    const { data } = await api.get(ENDPOINTS.expenses.base(tripId));
    return data?.data?.expenses ?? data?.data ?? data;
  },

  async create(tripId, payload) {
    const { data } = await api.post(ENDPOINTS.expenses.base(tripId), payload);
    return data?.data?.expense ?? data?.data ?? data;
  },

  async update(expenseId, payload) {
    const { data } = await api.put(ENDPOINTS.expenses.byId(expenseId), payload);
    return data?.data?.expense ?? data?.data ?? data;
  },

  async remove(expenseId) {
    const { data } = await api.delete(ENDPOINTS.expenses.byId(expenseId));
    return data?.data ?? data;
  },
};

export default expenseService;
