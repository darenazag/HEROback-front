import { useState } from 'react';
import { useFetch } from '../hooks/useFetch.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { getHeroes } from '../api/resources.js';
import HeroGrid from '../components/HeroGrid.jsx';

/**
 * @file pages/HeroesPage.jsx
 * @description Catálogo paginado con filtros (búsqueda por nombre,
 * alignment y publisher). Persiste los últimos filtros aplicados en
 * localStorage para mejorar la experiencia entre sesiones.
 */
function HeroesPage() {
    // Filtros persistidos en localStorage
    const [filters, setFilters] = useLocalStorage('heroback:filters', {
        search: '',
        alignment: '',
        publisher: '',
    });
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebounce(filters.search, 400);
    const debouncedPublisher = useDebounce(filters.publisher, 400);

    const { data, loading, error } = useFetch(
        () => getHeroes({
            page,
            limit: 24,
            alignment: filters.alignment || undefined,
            publisher: debouncedPublisher || undefined,
            search: debouncedSearch || undefined,
        }),
        [page, filters.alignment, debouncedSearch, debouncedPublisher],
    );

    const update = (patch) => {
        setFilters((prev) => ({ ...prev, ...patch }));
        setPage(1);
    };

    const pagination = data?.pagination || { page, pages: 1, total: 0 };
    const heroes = data?.data || [];

    return (
        <div className="container">
            <h1>Catálogo de héroes</h1>
            <p className="muted" style={{ marginBottom: '1.5rem' }}>
                {pagination.total} héroes en total
            </p>

            <div className="filter-bar">
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="f-search">Buscar</label>
                    <input
                        id="f-search"
                        type="search"
                        value={filters.search}
                        onChange={(e) => update({ search: e.target.value })}
                        placeholder="Nombre del héroe…"
                    />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="f-align">Alignment</label>
                    <select
                        id="f-align"
                        value={filters.alignment}
                        onChange={(e) => update({ alignment: e.target.value })}
                    >
                        <option value="">Todos</option>
                        <option value="good">Héroes</option>
                        <option value="bad">Villanos</option>
                        <option value="neutral">Neutrales</option>
                        <option value="unknown">Desconocidos</option>
                    </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="f-pub">Publisher</label>
                    <input
                        id="f-pub"
                        type="text"
                        value={filters.publisher}
                        onChange={(e) => update({ publisher: e.target.value })}
                        placeholder="Marvel, DC…"
                    />
                </div>
                <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => { setFilters({ search: '', alignment: '', publisher: '' }); setPage(1); }}
                >
                    Limpiar
                </button>
            </div>

            <HeroGrid
                heroes={heroes}
                loading={loading}
                error={error}
                emptyText="Ningún héroe coincide con esos filtros."
            />

            {pagination.pages > 1 && (
                <div className="pagination">
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        ← Anterior
                    </button>
                    <span>Página {pagination.page} de {pagination.pages}</span>
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        disabled={page >= pagination.pages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Siguiente →
                    </button>
                </div>
            )}
        </div>
    );
}

export default HeroesPage;
