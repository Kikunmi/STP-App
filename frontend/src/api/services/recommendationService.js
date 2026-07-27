import api from '../client';
import { ENDPOINTS } from '../endpoints';

export const recommendationService = {
  async getAll() {
    const { data } = await api.get(ENDPOINTS.recommendations.base);
    return data?.data?.recommendations ?? data?.data ?? data;
  },

  async getForTrip(tripId) {
    const { data } = await api.get(ENDPOINTS.recommendations.forTrip(tripId));
    return data?.data?.recommendations ?? data?.data ?? data;
  },

  async generate(payload) {
    const { data } = await api.post(ENDPOINTS.recommendations.generate, payload);
    return data?.data?.recommendation ?? data?.data ?? data;
  },
};

export default recommendationService;
