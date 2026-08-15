export const getErrorMessage = (error, fallback) => {
    const detail = error.response?.data?.detail;

    if (typeof detail === "string") {
        return detail;
    }

    if (Array.isArray(detail)) {
        return detail
            .map(item => item.msg || item.message)
            .filter(Boolean)
            .join(" ") || fallback;
    }

    if (!error.response) {
        return "No se pudo conectar con el servidor.";
    }

    return fallback;
};
