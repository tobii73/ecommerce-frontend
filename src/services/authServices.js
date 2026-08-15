import axios from "../api/axios";

// La capa de servicios concentra las URLs HTTP y evita que los componentes
// conozcan detalles de Axios o de los endpoints del backend.
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
    // Esta petición necesita el token recién obtenido porque aún no existe una
    // sesión persistida que el interceptor pueda adjuntar automáticamente.
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
