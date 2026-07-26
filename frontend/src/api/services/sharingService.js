import api from '../client';
import { ENDPOINTS } from '../endpoints';

export const sharingService = {
  async createShareLink(tripId) {
    const { data } = await api.post(ENDPOINTS.sharing.share(tripId));
    return data?.data ?? data;
  },

  async getSharedTrip(shareId) {
    const { data } = await api.get(ENDPOINTS.sharing.shared(shareId));
    return data?.data ?? data;
  },

  async revokeShare(shareId) {
    const { data } = await api.delete(ENDPOINTS.sharing.shared(shareId));
    return data?.data ?? data;
  },
};

export default sharingService;
