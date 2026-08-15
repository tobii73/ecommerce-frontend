import axios from "../api/axios";

export const register = (formData) => {
    return axios.post(
        "/user/registration",
        formData
    );
};

export const login = (formData) => {
    return axios.post(
        "/user/login",
        formData
    );
};

export const getCurrentUser = async (token) => {
    return await axios.get("/user/me", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const refreshAccessToken = async (refreshToken) => {
    return await axios.post("/user/refresh", {
        refresh_token: refreshToken
    });
};
