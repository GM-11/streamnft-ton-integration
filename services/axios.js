import axios from "axios";

export const shopBaseURL =
  process.env.NEXT_PUBLIC_SHOP_API_URL ??
  "https://launchpad-staging.danlabs.xyz";

// Base URLs
export const utilityBaseURL =
  process.env.NEXT_PUBLIC_UTILITY_API_URL ?? "https://utility-dev.danlabs.xyz";

export const scoreBaseURL =
  process.env.NEXT_PUBLIC_SCORE_API_URL ?? "https://user-dev.danlabs.xyz";

export const indexerBaseURL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api-staging.danlabs.xyz";

export const nftCacheBaseURL =
  process.env.NEXT_PUBLIC_NFTCACHE_API_URL ?? "https://nfts-dev.danlabs.xyz";

const apiKey = process.env.NEXT_PUBLIC_STREAMNFT_API_KEY;

// Create axios instances without Authorization initially
export const utilityAxiosInstance = axios.create({
  baseURL: utilityBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const scoreAxiosInstance = axios.create({
  baseURL: scoreBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const nftCacheAxiosInstance = axios.create({
  baseURL: nftCacheBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const indexerAxiosInstance = axios.create({
  baseURL: indexerBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const shopAxiosInstance = axios.create({
  baseURL: shopBaseURL,
});

// Interceptors for adding dynamic headers
utilityAxiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const wallet = localStorage.getItem("walletAddress");
      config.headers["api-key"] = apiKey;

      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }

      if (wallet) {
        config.params = { ...config.params, wallet: wallet };
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

scoreAxiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      config.headers["api-key"] = apiKey;

      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

nftCacheAxiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      config.headers["api-key"] = apiKey;

      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

indexerAxiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const wallet = localStorage.getItem("walletAddress");
      config.headers["api-key"] = apiKey;

      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      if (wallet) {
        config.params = { ...config.params, wallet: wallet };
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Utility functions for API requests
const getRequest = async (url, config = {}, isPointsApi = false) => {
  try {
    const token = localStorage.getItem("token") ?? "";
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;

    const response = isPointsApi
      ? await scoreAxiosInstance.get(url, config)
      : await utilityAxiosInstance.get(url, config);
    return response;
  } catch (error) {
    throw error;
  }
};

const postRequest = async (url, data, config = {}, isPointsApi = false) => {
  try {
    const token = localStorage.getItem("token") ?? "";
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;

    const response = isPointsApi
      ? await scoreAxiosInstance.post(url, data, config)
      : await utilityAxiosInstance.post(url, data, config);
    return response;
  } catch (error) {
    throw error;
  }
};

const putRequest = async (url, data, config = {}, isPointsApi = false) => {
  try {
    const token = localStorage.getItem("token") ?? "";
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;

    const response = isPointsApi
      ? await scoreAxiosInstance.put(url, data, config)
      : await utilityAxiosInstance.put(url, data, config);
    return response;
  } catch (error) {
    return error;
  }
};

const deleteRequest = async (url, config = {}, isPointsApi = false) => {
  try {
    const token = localStorage.getItem("token") ?? "";
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;

    const response = isPointsApi
      ? await scoreAxiosInstance.delete(url, data, config)
      : await utilityAxiosInstance.delete(url, data, config);
    return response;
  } catch (error) {
    return error;
  }
};

export { getRequest, postRequest, putRequest, deleteRequest };
