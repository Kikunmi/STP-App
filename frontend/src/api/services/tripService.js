import api from '../client';
import { ENDPOINTS } from '../endpoints';

export const tripService = {
  async getAll() {
    const { data } = await api.get(ENDPOINTS.trips.base);
    return data?.data ?? data;
  },

  async getUpcoming() {
    const { data } = await api.get(ENDPOINTS.trips.upcoming);
    return data?.data ?? data;
  },

  async getById(id) {
    const { data } = await api.get(ENDPOINTS.trips.byId(id));
    return data?.data ?? data;
  },

  async create(payload) {
    const { data } = await api.post(ENDPOINTS.trips.base, payload);
    return data?.data ?? data;
  },

  async update(id, payload) {
    const { data } = await api.put(ENDPOINTS.trips.byId(id), payload);
    return data?.data ?? data;
  },

  async remove(id) {
    const { data } = await api.delete(ENDPOINTS.trips.byId(id));
    return data?.data ?? data;
  },
};

export default tripService;
