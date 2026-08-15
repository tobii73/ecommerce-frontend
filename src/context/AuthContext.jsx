import { createContext, useEffect, useState } from "react";
import {
    readStoredJSON,
    removeStoredValue,
    writeStoredJSON
} from "../utils/storage";

export const AuthContext = createContext();

const EMPTY_AUTH = {
    user: null,
    accessToken: "",
    refreshToken: ""
};

// Antes de restaurar una sesión persistida, verificamos su forma mínima.
// Así un localStorage corrupto no rompe el inicio de la aplicación.
const isValidAuth = value =>
    value !== null &&
    typeof value === "object" &&
    (value.user === null || typeof value.user === "object") &&
    typeof value.accessToken === "string" &&
    typeof value.refreshToken === "string";

export const AuthProvider = ({ children }) => {

    // El inicializador diferido se ejecuta solo al montar el provider; evita
    // leer localStorage en cada render y permite restaurar la sesión al recargar.
    const [auth, setAuth] = useState(() => {
        return readStoredJSON("auth", EMPTY_AUTH, isValidAuth);
    });

    const logout = () => {
        // La sesión en memoria y la persistida deben limpiarse juntas.
        setAuth(EMPTY_AUTH);
        removeStoredValue("auth");
    };
    
    const updateAuth = (newAuth) => {
        // Este método es la única entrada normal para crear/actualizar una sesión.
        setAuth(newAuth);
        writeStoredJSON("auth", newAuth);
    };

    useEffect(() => {
        // axios avisa mediante eventos cuando renovó el token o cuando la sesión
        // expiró. El contexto refleja esos cambios en toda la interfaz.
        const handleTokenRefresh = (event) => {
            setAuth(currentAuth => ({
                ...currentAuth,
                accessToken: event.detail.accessToken
            }));
        };

        const handleSessionExpired = () => {
            setAuth(EMPTY_AUTH);
        };

        window.addEventListener("auth-token-refreshed", handleTokenRefresh);
        window.addEventListener("auth-session-expired", handleSessionExpired);

        return () => {
            window.removeEventListener(
                "auth-token-refreshed",
                handleTokenRefresh
            );
            window.removeEventListener(
                "auth-session-expired",
                handleSessionExpired
            );
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                auth,
                setAuth: updateAuth,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
