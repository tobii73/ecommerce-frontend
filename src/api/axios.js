import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
    baseURL: API_URL,
});

let refreshPromise = null;

const getStoredAuth = () => {
    try {
        const savedAuth = localStorage.getItem("auth");
        return savedAuth ? JSON.parse(savedAuth) : null;
    } catch {
        return null;
    }
};

const publicAuthPaths = [
    "/user/login",
    "/user/registration",
    "/user/refresh"
];

api.interceptors.request.use(config => {
    const storedAuth = getStoredAuth();
    const alreadyHasToken = Boolean(config.headers.Authorization);

    if (storedAuth?.accessToken && !alreadyHasToken) {
        config.headers.Authorization = `Bearer ${storedAuth.accessToken}`;
    }

    return config;
});

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        const isPublicAuthRequest = publicAuthPaths.some(path =>
            originalRequest?.url?.includes(path)
        );

        if (
            error.response?.status !== 401 ||
            !originalRequest ||
            originalRequest._retry ||
            isPublicAuthRequest
        ) {
            return Promise.reject(error);
        }

        const storedAuth = getStoredAuth();

        if (!storedAuth?.refreshToken) {
            localStorage.removeItem("auth");
            window.dispatchEvent(new Event("auth-session-expired"));
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            if (!refreshPromise) {
                refreshPromise = axios
                    .post(`${API_URL}/user/refresh`, {
                        refresh_token: storedAuth.refreshToken
                    })
                    .then(response => response.data.access_token)
                    .finally(() => {
                        refreshPromise = null;
                    });
            }

            const newAccessToken = await refreshPromise;
            const updatedAuth = {
                ...storedAuth,
                accessToken: newAccessToken
            };

            localStorage.setItem("auth", JSON.stringify(updatedAuth));
            window.dispatchEvent(
                new CustomEvent("auth-token-refreshed", {
                    detail: { accessToken: newAccessToken }
                })
            );

            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            return api(originalRequest);
        } catch (refreshError) {
            localStorage.removeItem("auth");
            window.dispatchEvent(new Event("auth-session-expired"));
            return Promise.reject(refreshError);
        }
    }
);

export default api;
