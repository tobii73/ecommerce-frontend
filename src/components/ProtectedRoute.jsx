import React, {useContext} from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'



export const ProtectedRoute = ({ children, allowedRoles = [] }) => {

    const {auth} = useContext(AuthContext)
    const location = useLocation();

    if (!auth.user || !auth.accessToken) {
        // Guardamos la ruta solicitada para volver aquí tras iniciar sesión.
        return (
            <Navigate
                to="/login"
                state={{ from: location.pathname }}
                replace
            />
        );
    }

    const hasRequiredRole =
        allowedRoles.length === 0 || allowedRoles.includes(auth.user.role);

    if (!hasRequiredRole) {
        // Estar autenticado no implica tener permiso para cada sección.
        return <Navigate to="/" replace />;
    }

    return children;
}
