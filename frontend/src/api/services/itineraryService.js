import api from '../client';
import { ENDPOINTS } from '../endpoints';

export const itineraryService = {
  async getAll(tripId) {
    const { data } = await api.get(ENDPOINTS.itinerary.base(tripId));
    return data?.data?.itineraries ?? data?.data ?? data;
  },

  async create(tripId, payload) {
    const { data } = await api.post(ENDPOINTS.itinerary.base(tripId), payload);
    return data?.data?.itinerary ?? data?.data ?? data;
  },

  async update(itemId, payload) {
    const { data } = await api.put(ENDPOINTS.itinerary.byId(itemId), payload);
    return data?.data?.itinerary ?? data?.data ?? data;
  },

  async remove(itemId) {
    const { data } = await api.delete(ENDPOINTS.itinerary.byId(itemId));
    return data?.data ?? data;
  },
};

export default itineraryService;
