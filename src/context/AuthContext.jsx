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

const isValidAuth = value =>
    value !== null &&
    typeof value === "object" &&
    (value.user === null || typeof value.user === "object") &&
    typeof value.accessToken === "string" &&
    typeof value.refreshToken === "string";

export const AuthProvider = ({ children }) => {

    const [auth, setAuth] = useState(() => {
        return readStoredJSON("auth", EMPTY_AUTH, isValidAuth);
    });

    const logout = () => {
        setAuth(EMPTY_AUTH);
        removeStoredValue("auth");
    };
    
    const updateAuth = (newAuth) => {
        setAuth(newAuth);
        writeStoredJSON("auth", newAuth);
    };

    useEffect(() => {
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
