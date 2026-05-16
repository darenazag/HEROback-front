import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { getHero, heroImageUrl, addHeroToCollection } from '../api/resources.js';
import { useAuth } from '../context/AuthContext.jsx';

const STATS = [
    ['intelligence', 'Inteligencia'],
    ['strength', 'Fuerza'],
    ['speed', 'Velocidad'],
    ['durability', 'Durabilidad'],
    ['power', 'Poder'],
    ['combat', 'Combate'],
];

/**
 * @file pages/HeroDetailPage.jsx
 * @description Ficha completa de un héroe con estadísticas y botón
 * para añadirlo a la colección del usuario logueado.
 */
function HeroDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const { data: hero, loading, error } = useFetch(() => getHero(id), [id]);
    const [adding, setAdding] = useState(false);
    const [msg, setMsg] = useState(/** @type {{ type: 'ok'|'err', text: string }|null} */(null));
    const [owned, setOwned] = useState(false);

    if (loading) {
        return <div className="container"><div className="empty-state"><p>Cargando héroe…</p></div></div>;
    }
    if (error || !hero) {
        return (
            <div className="container">
                <div className="alert alert-error">{error?.message || 'Héroe no encontrado'}</div>
                <Link to="/heroes" className="btn btn-outline">← Volver al catálogo</Link>
            </div>
        );
    }

    const handleAdd = async () => {
        setAdding(true);
        setMsg(null);
        try {
            await addHeroToCollection(hero.id);
            setOwned(true);
            setMsg({ type: 'ok', text: '¡Héroe añadido a tu colección!' });
        } catch (err) {
            setMsg({ type: 'err', text: err.message });
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="container">
            <div className="hero-detail">
                <div className="hero-detail-image">
                    <img
                        src={heroImageUrl(hero.id)}
                        alt={hero.name}
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/placeholder.svg';
                        }}
                    />
                </div>
                <div className="hero-detail-info">
                    <h1>{hero.name}</h1>
                    <div className="hero-meta">
                        {hero.alignment && (
                            <span className={`tag ${hero.alignment}`}>{hero.alignment}</span>
                        )}
                        {hero.publisher && (
                            <span className="publisher">{hero.publisher}</span>
                        )}
                    </div>

                    <h2>Estadísticas</h2>
                    <div className="stats-grid">
                        {STATS.map(([key, label]) => (
                            <div className="stat-item" key={key}>
                                <span className="stat-label">{label}</span>
                                <div className="stat-bar">
                                    <div
                                        className="stat-fill"
                                        style={{ width: `${hero[key] ?? 0}%` }}
                                    />
                                </div>
                                <span className="stat-value">{hero[key] ?? 0}</span>
                            </div>
                        ))}
                    </div>

                    {msg && (
                        <div className={`alert ${msg.type === 'ok' ? 'alert-success' : 'alert-error'}`}>
                            {msg.text}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <Link to="/heroes" className="btn btn-outline">← Volver</Link>
                        {user && (
                            <button
                                type="button"
                                className="btn btn-accent"
                                onClick={handleAdd}
                                disabled={adding || owned}
                            >
                                {owned ? '✓ En tu colección' : adding ? 'Añadiendo…' : 'Añadir a mi colección'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HeroDetailPage;
