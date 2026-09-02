import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

const API_BASE_URL = "/api/v1";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json"
      },
      timeout: 15000
    });

    // Request Interceptor: Attach Access Token
    this.client.interceptors.request.use(
      (config) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("cine_access_token") || localStorage.getItem("token") : null;
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor: Handle Refresh Token on 401
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry && typeof window !== "undefined") {
          originalRequest._retry = true;
          const refreshToken = localStorage.getItem("cine_refresh_token");

          if (refreshToken) {
            try {
              const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
              if (res.data?.data?.tokens?.accessToken) {
                const newAccess = res.data.data.tokens.accessToken;
                const newRefresh = res.data.data.tokens.refreshToken;

                localStorage.setItem("cine_access_token", newAccess);
                localStorage.setItem("token", newAccess);
                if (newRefresh) {
                  localStorage.setItem("cine_refresh_token", newRefresh);
                }

                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                }
                return this.client(originalRequest);
              }
            } catch {
              // Refresh failed: clear session tokens
              localStorage.removeItem("cine_access_token");
              localStorage.removeItem("cine_refresh_token");
              localStorage.removeItem("token");
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
