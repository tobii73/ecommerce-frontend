import { getErrorMessage } from "./getErrorMessage";

export const getOrderErrorMessage = (error, fallback) => {
    if (!error.response) {
        return "No se pudo conectar con el servidor. Revisá tu conexión e intentá nuevamente.";
    }

    if (error.response.status === 404) {
        return getErrorMessage(error, "El pedido solicitado no existe.");
    }

    if (error.response.status === 403) {
        return getErrorMessage(error, "No tenés permiso para acceder o modificar este pedido.");
    }

    return getErrorMessage(error, fallback);
};
