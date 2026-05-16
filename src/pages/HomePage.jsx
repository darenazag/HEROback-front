import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { getHeroes } from '../api/resources.js';
import HeroGrid from '../components/HeroGrid.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * @file pages/HomePage.jsx
 * @description Página de inicio. Carga 12 héroes destacados.
 */
function HomePage() {
    const { user } = useAuth();
    const { data, loading, error } = useFetch(
        () => getHeroes({ page: 1, limit: 12 }),
        [],
    );

    return (
        <div className="container">
            <section className="hero-banner">
                <h1>Bienvenido a HEROback</h1>
                <p>
                    Colecciona héroes, forma equipos de combate y conquista la tienda.
                    Cada superhéroe trae sus stats reales — equípate y demuéstralo.
                </p>
                <div className="hero-banner-cta">
                    <Link to="/heroes" className="btn">Ver catálogo completo</Link>
                    {!user && (
                        <Link to="/register" className="btn btn-outline">Crear cuenta</Link>
                    )}
                </div>
            </section>

            <div className="section-header">
                <h2>Héroes destacados</h2>
                <Link to="/heroes" className="muted">Ver todos →</Link>
            </div>

            <HeroGrid
                heroes={data?.data || []}
                loading={loading}
                error={error}
                skeletonCount={12}
            />
        </div>
    );
}

export default HomePage;
