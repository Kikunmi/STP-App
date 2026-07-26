import api from '../client';
import { ENDPOINTS } from '../endpoints';

export const itineraryService = {
  async getAll(tripId) {
    const { data } = await api.get(ENDPOINTS.itinerary.base(tripId));
    return data?.data ?? data;
  },

  async create(tripId, payload) {
    const { data } = await api.post(ENDPOINTS.itinerary.base(tripId), payload);
    return data?.data ?? data;
  },

  async update(tripId, itemId, payload) {
    const { data } = await api.put(ENDPOINTS.itinerary.byId(tripId, itemId), payload);
    return data?.data ?? data;
  },

  async remove(tripId, itemId) {
    const { data } = await api.delete(ENDPOINTS.itinerary.byId(tripId, itemId));
    return data?.data ?? data;
  },

  async reorder(tripId, ordering) {
    const { data } = await api.post(ENDPOINTS.itinerary.reorder(tripId), { ordering });
    return data?.data ?? data;
  },
};

export default itineraryService;
