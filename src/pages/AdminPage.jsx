import { useState } from 'react';
import { api } from '../api/client.js';
import { useFetch } from '../hooks/useFetch.js';

/**
 * @file pages/AdminPage.jsx
 * @description Panel de administración (sólo rol admin). Muestra stats
 * generales y la lista de usuarios con opción de eliminar.
 */
function AdminPage() {
    const { data: stats } = useFetch(() => api.get('/api/admin/stats'), []);
    const { data: usersData, loading, refresh } = useFetch(() => api.get('/api/users'), []);
    const [feedback, setFeedback] = useState(/** @type {string|null} */(null));

    const users = usersData?.data || [];

    const remove = async (id) => {
        if (!confirm('¿Eliminar este usuario? Esta acción es irreversible.')) return;
        try {
            await api.del(`/api/users/${id}`);
            refresh();
        } catch (err) {
            setFeedback(err.message);
        }
    };

    return (
        <div className="container">
            <h1>Panel de administración</h1>

            {feedback && <div className="alert alert-error">{feedback}</div>}

            <div className="stats-cards">
                <div className="stat-card">
                    <span className="stat-number">{stats?.totalUsers ?? '—'}</span>
                    <span className="stat-label">Usuarios</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">{stats?.totalHeroes ?? '—'}</span>
                    <span className="stat-label">Héroes</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">{stats?.totalProducts ?? '—'}</span>
                    <span className="stat-label">Productos</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">{stats?.totalCollections ?? '—'}</span>
                    <span className="stat-label">Colecciones</span>
                </div>
            </div>

            <h2 style={{ margin: '2rem 0 1rem' }}>Usuarios</h2>
            {loading && <p className="muted">Cargando…</p>}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '0.6rem' }}>ID</th>
                            <th style={{ padding: '0.6rem' }}>Usuario</th>
                            <th style={{ padding: '0.6rem' }}>Email</th>
                            <th style={{ padding: '0.6rem' }}>Rol</th>
                            <th style={{ padding: '0.6rem' }}>Coins</th>
                            <th style={{ padding: '0.6rem' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '0.6rem' }}>{u.id}</td>
                                <td style={{ padding: '0.6rem' }}>{u.username}</td>
                                <td style={{ padding: '0.6rem' }}>{u.email}</td>
                                <td style={{ padding: '0.6rem' }}>
                                    <span className={`role-badge ${u.role}`}>{u.role}</span>
                                </td>
                                <td style={{ padding: '0.6rem' }}>{u.coins}</td>
                                <td style={{ padding: '0.6rem', textAlign: 'right' }}>
                                    <button
                                        type="button"
                                        className="btn btn-outline btn-sm"
                                        onClick={() => remove(u.id)}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminPage;
