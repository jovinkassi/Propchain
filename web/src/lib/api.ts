import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4002",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("propchain_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getProperties = () => api.get("/api/properties").then((r) => r.data);
export const getProperty = (id: string) => api.get(`/api/properties/${id}`).then((r) => r.data);
export const getMyPortfolio = () => api.get("/api/users/me/portfolio").then((r) => r.data);
export const getMyTransactions = () => api.get("/api/transactions").then((r) => r.data);

export default api;
