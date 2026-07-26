import api from '../client';
import { ENDPOINTS } from '../endpoints';

/**
 * Normalize the various auth response shapes the backend may return into
 * a consistent `{ token, user }` object.
 */
const normalizeAuthResponse = (data) => {
  const token =
    data?.accessToken ||
    data?.token ||
    data?.data?.accessToken ||
    data?.data?.token ||
    null;
  const user = data?.data?.user || data?.user || null;
  return { token, user };
};

export const authService = {
  async login(payload) {
    const { data } = await api.post(ENDPOINTS.auth.login, payload);
    return normalizeAuthResponse(data);
  },

  async register(payload) {
    const { data } = await api.post(ENDPOINTS.auth.register, payload);
    return normalizeAuthResponse(data);
  },

  async getProfile() {
    const { data } = await api.get(ENDPOINTS.auth.profile);
    return data?.data?.user || data?.user || data;
  },
};

export default authService;
