import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setAuthToken(null);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  verify: async () => {
    const response = await api.get("/auth/verify");
    return response.data;
  },

  register: async (userData: {
    username: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },
};

export const jokesAPI = {
  search: async (params: {
    category?: string;
    keyword?: string;
    author?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get("/jokes/search", { params });
    return response.data;
  },

  create: async (joke: {
    title: string;
    content: string;
    category: string;
    author: string;
  }) => {
    const response = await api.post("/jokes", joke);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/jokes/${id}`);
    return response.data;
  },

  like: async (id: string) => {
    const response = await api.post(`/jokes/${id}/like`);
    return response.data;
  },

  getAll: async (params: {
    page?: number;
    limit?: number;
    category?: string;
  }) => {
    const response = await api.get("/jokes", { params });
    return response.data;
  },
};

export const healthAPI = {
  check: async () => {
    const response = await api.get("/health");
    return response.data;
  },
};

export default api;
