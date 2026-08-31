import axios, { AxiosError } from "axios";
import i18n from "./i18n";

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    translationKey: string;
    params?: Record<string, unknown>;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

let _accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  _accessToken = token;
};

export const getAccessToken = () => _accessToken;

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });

  failedQueue = [];
};

let _lastActivityTimestamp = Date.now();

if (typeof window !== "undefined") {
  const updateActivity = () => {
    _lastActivityTimestamp = Date.now();
  };

  window.addEventListener("mousemove", updateActivity);
  window.addEventListener("keydown", updateActivity);
  window.addEventListener("click", updateActivity);
  window.addEventListener("scroll", updateActivity);
}

const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutes

const isUserInactive = () => {
  return Date.now() - _lastActivityTimestamp > INACTIVITY_LIMIT_MS;
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && originalRequest) {
      // 1. Check for user inactivity
      if (isUserInactive()) {
        localStorage.removeItem("@financial:refresh_token");
        setAccessToken(null);
        window.location.href = "/";
        return Promise.reject(new Error("Sessão expirada por inatividade"));
      }

      // 2. Avoid infinite loop if the refresh request itself fails
      if (originalRequest.url?.endsWith("/auth/refresh")) {
        localStorage.removeItem("@financial:refresh_token");
        setAccessToken(null);
        window.location.href = "/";
        return Promise.reject(error);
      }

      // 3. Queue request if refresh is already in progress
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err) => {
              reject(err);
            },
          });
        });
      }

      isRefreshing = true;

      const refreshToken = localStorage.getItem("@financial:refresh_token");
      if (!refreshToken) {
        isRefreshing = false;
        setAccessToken(null);
        window.location.href = "/";
        return Promise.reject(error);
      }

      return new Promise((resolve, reject) => {
        api
          .post("/auth/refresh", { refreshToken })
          .then((response) => {
            const { accessToken, refreshToken: newRefreshToken } =
              response.data;
            setAccessToken(accessToken);
            localStorage.setItem("@financial:refresh_token", newRefreshToken);

            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            processQueue(null, accessToken);
            resolve(api(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            localStorage.removeItem("@financial:refresh_token");
            setAccessToken(null);
            window.location.href = "/";
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    if (error.response?.data?.error) {
      const { translationKey, params, message } = error.response.data.error;
      const translatedMessage = i18n.t(translationKey, {
        ...params,
        defaultValue: message,
      });

      return Promise.reject(new Error(translatedMessage));
    }

    return Promise.reject(new Error("Erro de comunicação com o servidor"));
  },
);
