export const readStoredJSON = (key, fallback, isValid) => {
    try {
        const storedValue = localStorage.getItem(key);

        if (storedValue === null) {
            return fallback;
        }

        const parsedValue = JSON.parse(storedValue);

        if (isValid && !isValid(parsedValue)) {
            localStorage.removeItem(key);
            return fallback;
        }

        return parsedValue;
    } catch {
        try {
            localStorage.removeItem(key);
        } catch {
            // El navegador puede bloquear por completo el almacenamiento.
        }

        return fallback;
    }
};

export const writeStoredJSON = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // La aplicación sigue funcionando aunque el navegador no permita guardar.
    }
};

export const removeStoredValue = (key) => {
    try {
        localStorage.removeItem(key);
    } catch {
        // No hace falta interrumpir la aplicación si el storage está bloqueado.
    }
};
