import axios, { type AxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "https://backend-zylo.vercel.app";

function normalizeHeaders(headers?: HeadersInit) {
  if (!headers) return undefined;
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return headers;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const session = JSON.parse(localStorage.getItem("zylo_session") || "null");
  if (session?.token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("zylo_session");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export async function apiFetch(path: string, options: RequestInit & { params?: AxiosRequestConfig["params"] } = {}) {
  const { body, headers, method, params } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const response = await apiClient.request({
    url: path,
    method,
    data: body,
    headers: isFormData
      ? normalizeHeaders(headers)
      : { "Content-Type": "application/json", ...normalizeHeaders(headers) },
    params,
  });
  return response.data;
}