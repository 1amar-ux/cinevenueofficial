import { apiClient, setAuthToken, clearAuthToken } from './client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  role: string;
  cineCoinsBalance: number;
}

export const authApi = {
  login: async (credentials: { email: string; password?: string; otp?: string }) => {
    const res = await apiClient.post('/auth/login', credentials);
    const token = res.data?.token || res.data?.data?.tokens?.accessToken;
    if (token) {
      await setAuthToken(token);
    }
    return res.data;
  },

  register: async (userData: { name: string; email: string; mobile?: string; password?: string }) => {
    const res = await apiClient.post('/auth/register', userData);
    const token = res.data?.token || res.data?.data?.tokens?.accessToken;
    if (token) {
      await setAuthToken(token);
    }
    return res.data;
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    const res = await apiClient.get('/auth/me');
    return res.data?.data?.user || res.data?.user || res.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // Ignored
    } finally {
      await clearAuthToken();
    }
  },

  forgotPassword: async (email: string) => {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    const res = await apiClient.put('/auth/profile', data);
    return res.data;
  }
};
