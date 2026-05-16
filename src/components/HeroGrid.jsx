import HeroCard from './HeroCard.jsx';

/**
 * @file components/HeroGrid.jsx
 * @description Renderiza un grid de tarjetas de héroes con estados de
 * carga (skeletons) y vacío.
 *
 * @param {{
 *   heroes: any[],
 *   loading?: boolean,
 *   error?: Error|null,
 *   emptyText?: string,
 *   skeletonCount?: number,
 * }} props
 */
function HeroGrid({ heroes, loading, error, emptyText = 'No hay héroes para mostrar.', skeletonCount = 8 }) {
    if (loading) {
        return (
            <div className="hero-grid" aria-busy="true">
                {Array.from({ length: skeletonCount }).map((_, i) => (
                    <div className="hero-card" key={i}>
                        <div className="skeleton" style={{ aspectRatio: '2/3' }} />
                        <div className="hero-card-body">
                            <div className="skeleton" style={{ height: 14, width: '70%' }} />
                            <div className="skeleton" style={{ height: 10, width: '45%', marginTop: 8 }} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error" role="alert">
                Error cargando héroes: {error.message}
            </div>
        );
    }

    if (!heroes || heroes.length === 0) {
        return <div className="empty-state"><p>{emptyText}</p></div>;
    }

    return (
        <div className="hero-grid">
            {heroes.map((h) => <HeroCard key={h.id} hero={h} />)}
        </div>
    );
}

export default HeroGrid;
