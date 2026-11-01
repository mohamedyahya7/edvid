import { useAuthStore } from "@/lib/store/authStore";
import axios from "axios";

// This should be the single source of truth for your API URL.
// Consider moving it to a dedicated environment configuration file later.

export const url = "https://bamboo-w.com";

export const storageUrl = `${url}/storage/`;
export const API_BASE_URL = `${url}/api/v1`;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add the auth token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
