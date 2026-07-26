import api from '../client';
import { ENDPOINTS } from '../endpoints';

export const expenseService = {
  async getAll(tripId) {
    const { data } = await api.get(ENDPOINTS.expenses.base(tripId));
    return data?.data ?? data;
  },

  async create(tripId, payload) {
    const { data } = await api.post(ENDPOINTS.expenses.base(tripId), payload);
    return data?.data ?? data;
  },

  async update(tripId, expenseId, payload) {
    const { data } = await api.put(ENDPOINTS.expenses.byId(tripId, expenseId), payload);
    return data?.data ?? data;
  },

  async remove(tripId, expenseId) {
    const { data } = await api.delete(ENDPOINTS.expenses.byId(tripId, expenseId));
    return data?.data ?? data;
  },
};

export default expenseService;
