import api from '../client';
import { ENDPOINTS } from '../endpoints';

export const sharingService = {
  /**
   * Share a trip with another user by email or username.
   * @param {{ tripId: string, identifier: string, identifierType?: 'email'|'username' }} params
   */
  async shareWithUser({ tripId, identifier, identifierType }) {
    const { data } = await api.post(ENDPOINTS.sharing.share(tripId), {
      identifier,
      ...(identifierType ? { identifierType } : {}),
    });
    return data?.data ?? data;
  },

  async listShares(tripId) {
    const { data } = await api.get(ENDPOINTS.sharing.listShares(tripId));
    return data?.data?.shares ?? data?.data ?? data;
  },

  async unshare(tripId, sharedUserId) {
    const { data } = await api.delete(ENDPOINTS.sharing.unshare(tripId, sharedUserId));
    return data?.data ?? data;
  },

  async sharedWithMe() {
    const { data } = await api.get(ENDPOINTS.sharing.sharedWithMe);
    return data?.data?.sharedTrips ?? data?.data ?? data;
  },
};

export default sharingService;
