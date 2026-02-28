import axios from "axios";
import { storage } from "../utils/storage";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = storage.getToken();
  const csrfToken = storage.getCsrfToken();
  const method = (config.method ?? "get").toLowerCase();
  const hasBody = ["post", "put", "patch", "delete"].includes(method);
  const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (hasBody && !isFormData && !config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  if (csrfToken && ["post", "put", "patch", "delete"].includes(method)) {
    config.headers["x-csrf-token"] = csrfToken;
  }

  return config;
});
