import axios, { AxiosError } from 'axios';
import i18n from './i18n';

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

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('@financial:access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorResponse>) => {
        if (error.response?.data?.error) {
            const { translationKey, params, message } = error.response.data.error;
            const translatedMessage = i18n.t(translationKey, {
                ...params,
                defaultValue: message,
            });

            return Promise.reject(new Error(translatedMessage));
        }

        return Promise.reject(new Error('Erro de comunicação com o servidor'));
    }
);
