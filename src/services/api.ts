/**
 * CineVenue Core API Service
 * Bridges to the centralized apiClient with JWT and Refresh Token handling
 */
import { apiClient } from "./apiClient";

export const api = apiClient;
export default api;
