import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * @file components/ProtectedRoute.jsx
 * @description Envuelve una ruta que requiere usuario autenticado.
 * Opcionalmente puede exigir un rol concreto.
 *
 * @param {{ children: React.ReactNode, requireRole?: 'admin'|'user' }} props
 */
function ProtectedRoute({ children, requireRole }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="container">
                <div className="empty-state"><p>Cargando…</p></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (requireRole && user.role !== requireRole) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default ProtectedRoute;
