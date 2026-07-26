import api from '../client';
import { ENDPOINTS } from '../endpoints';

export const recommendationService = {
  async getAll() {
    const { data } = await api.get(ENDPOINTS.recommendations.base);
    return data?.data ?? data;
  },

  async getForTrip(tripId) {
    const { data } = await api.get(ENDPOINTS.recommendations.forTrip(tripId));
    return data?.data ?? data;
  },
};

export default recommendationService;
