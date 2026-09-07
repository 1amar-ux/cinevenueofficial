import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Config } from '../constants/config';

const AUTH_TOKEN_KEY = 'cinevenue_auth_token';

export const apiClient = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Platform': 'mobile',
  },
});

// Request Interceptor: Attach JWT Bearer token from secure mobile storage
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // SecureStore error fallback
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Normalize API errors and handle 401 unauthenticated
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY).catch(() => {});
    }

    const customMessage = (error.response?.data as any)?.message ||
      (error.message === 'Network Error' ? 'Unable to connect to CineVenue servers. Check your internet connection.' : error.message);

    return Promise.reject(new Error(customMessage));
  }
);

export const setAuthToken = async (token: string) => {
  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
};

export const clearAuthToken = async () => {
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
};

export const getStoredAuthToken = async () => {
  return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
};
