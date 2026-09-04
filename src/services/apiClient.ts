import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

const API_BASE_URL = "/api/v1";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json"
      },
      timeout: 15000
    });

    // Request Interceptor: attach admin passcode header if present in localStorage
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== "undefined") {
          const passcode = localStorage.getItem("cine_admin_passcode") || "8888";
          if (passcode && config.headers) {
            (config.headers as any)["x-admin-passcode"] = passcode;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor: refreshes the HttpOnly cookie session once on 401.
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry && typeof window !== "undefined") {
          originalRequest._retry = true;
          {
            try {
              const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
              if (res.data?.success) {
                return this.client(originalRequest);
              }
            } catch {
              // The server has rejected the session; the UI will resolve to signed out.
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
