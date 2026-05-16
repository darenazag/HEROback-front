import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { getMyTeams, getMyHeroes } from '../api/resources.js';

/**
 * @file pages/DashboardPage.jsx
 * @description Panel del usuario con stats rápidas y accesos.
 */
function DashboardPage() {
    const { user } = useAuth();
    const { data: teams } = useFetch(getMyTeams, []);
    const { data: heroes } = useFetch(getMyHeroes, []);

    if (!user) return null;

    return (
        <div className="container">
            <div className="dashboard-welcome">
                <h1>Hola, {user.username}</h1>
                <span className={`role-badge ${user.role}`}>{user.role}</span>
            </div>

            <div className="stats-cards">
                <div className="stat-card">
                    <span className="stat-number">{user.coins ?? '—'}</span>
                    <span className="stat-label">Coins disponibles</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">{heroes?.length ?? '—'}</span>
                    <span className="stat-label">Héroes en colección</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">{teams?.length ?? '—'}</span>
                    <span className="stat-label">Equipos creados</span>
                </div>
            </div>

            <div className="dashboard-nav">
                <Link to="/perfil" className="btn">Editar perfil</Link>
                <Link to="/heroes" className="btn btn-outline">Explorar héroes</Link>
                <Link to="/store" className="btn btn-outline">Ir a la tienda</Link>
                <Link to="/teams" className="btn btn-outline">Mis equipos</Link>
                {user.role === 'admin' && (
                    <Link to="/admin" className="btn btn-accent">Panel de administración</Link>
                )}
            </div>
        </div>
    );
}

export default DashboardPage;
