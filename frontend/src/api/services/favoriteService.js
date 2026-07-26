import api from '../client';
import { ENDPOINTS } from '../endpoints';

export const favoriteService = {
  async getAll() {
    const { data } = await api.get(ENDPOINTS.favorites.base);
    return data?.data ?? data;
  },

  async create(payload) {
    const { data } = await api.post(ENDPOINTS.favorites.base, payload);
    return data?.data ?? data;
  },

  async remove(id) {
    const { data } = await api.delete(ENDPOINTS.favorites.byId(id));
    return data?.data ?? data;
  },
};

export default favoriteService;
