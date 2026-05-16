import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import {
    getMyTeams,
    getMyHeroes,
    createTeam,
    deleteTeam,
    addHeroToTeam,
    removeHeroFromTeam,
    heroImageUrl,
} from '../api/resources.js';
import Modal from '../components/Modal.jsx';

const MAX_HEROES = 6;

/**
 * @file pages/TeamsPage.jsx
 * @description Gestión completa de equipos: crear, eliminar, añadir y
 * quitar héroes. Refresca los datos manualmente tras cada mutación
 * para mantener consistencia sin recargar la página.
 */
function TeamsPage() {
    const { data: teams, loading, error, refresh } = useFetch(getMyTeams, []);
    const { data: myHeroes, refresh: refreshMyHeroes } = useFetch(getMyHeroes, []);

    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [busy, setBusy] = useState(false);
    const [feedback, setFeedback] = useState(/** @type {string|null} */(null));

    const onCreate = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setBusy(true);
        try {
            await createTeam(newName.trim());
            setNewName('');
            setCreating(false);
            refresh();
        } catch (err) {
            setFeedback(err.message);
        } finally {
            setBusy(false);
        }
    };

    const onDelete = async (teamId) => {
        if (!confirm('¿Eliminar este equipo?')) return;
        try {
            await deleteTeam(teamId);
            refresh();
        } catch (err) {
            setFeedback(err.message);
        }
    };

    const onAddHero = async (teamId, userHeroId) => {
        if (!userHeroId) return;
        try {
            await addHeroToTeam(teamId, Number(userHeroId));
            refresh();
            refreshMyHeroes();
        } catch (err) {
            setFeedback(err.message);
        }
    };

    const onRemoveHero = async (teamId, userHeroId) => {
        if (!confirm('¿Quitar este héroe del equipo?')) return;
        try {
            await removeHeroFromTeam(teamId, userHeroId);
            refresh();
        } catch (err) {
            setFeedback(err.message);
        }
    };

    return (
        <div className="container">
            <div className="teams-header">
                <h1>Mis equipos</h1>
                <button type="button" className="btn" onClick={() => setCreating(true)}>
                    Crear equipo
                </button>
            </div>

            {feedback && (
                <div className="alert alert-error" onClick={() => setFeedback(null)}>
                    {feedback}
                </div>
            )}

            {(!myHeroes || myHeroes.length === 0) && (
                <div className="empty-state" style={{ marginBottom: '1.5rem' }}>
                    <p className="muted">
                        Aún no tienes héroes en tu colección. Para formar un equipo, primero
                        añade alguno desde el catálogo.
                    </p>
                    <Link to="/heroes" className="btn" style={{ marginTop: '1rem' }}>
                        Ir al catálogo
                    </Link>
                </div>
            )}

            {loading && <div className="empty-state"><p>Cargando equipos…</p></div>}
            {error && <div className="alert alert-error">{error.message}</div>}

            {teams && teams.length === 0 && !loading && (
                <div className="empty-state">
                    <p>Todavía no tienes equipos. ¡Crea el primero!</p>
                </div>
            )}

            <div className="teams-grid">
                {(teams || []).map((team) => {
                    const members = team.TeamHeroes || [];
                    const memberIds = new Set(members.map((m) => m.user_hero_id));
                    const available = (myHeroes || []).filter((uh) => !memberIds.has(uh.id));
                    const full = members.length >= MAX_HEROES;
                    return (
                        <article className="team-card" key={team.id}>
                            <header className="team-card-header">
                                <h3>{team.name}</h3>
                                <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={() => onDelete(team.id)}
                                >
                                    Eliminar
                                </button>
                            </header>

                            <div className="team-heroes">
                                {members.length === 0 && (
                                    <p className="muted">Sin héroes asignados todavía</p>
                                )}
                                {members.map((th) => th.UserHero?.Hero && (
                                    <div className="team-hero-slot" key={th.id}>
                                        <img
                                            src={heroImageUrl(th.UserHero.Hero.id)}
                                            alt={th.UserHero.Hero.name}
                                            title={th.UserHero.Hero.name}
                                            loading="lazy"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = '/placeholder.svg';
                                            }}
                                        />
                                        <span className="team-hero-slot-name">
                                            {th.UserHero.Hero.name}
                                        </span>
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-xs"
                                            onClick={() => onRemoveHero(team.id, th.user_hero_id)}
                                        >
                                            Quitar
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="team-actions">
                                {full ? (
                                    <p className="muted">Equipo lleno ({MAX_HEROES}/{MAX_HEROES})</p>
                                ) : available.length === 0 ? (
                                    <p className="muted">
                                        Todos tus héroes ya están en este equipo
                                    </p>
                                ) : (
                                    <AddHeroRow
                                        teamId={team.id}
                                        available={available}
                                        onAdd={onAddHero}
                                    />
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>

            <Modal open={creating} onClose={() => setCreating(false)} title="Nuevo equipo">
                <form onSubmit={onCreate}>
                    <div className="form-group">
                        <label htmlFor="team-name">Nombre del equipo</label>
                        <input
                            id="team-name"
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            autoFocus
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="btn" disabled={busy}>
                            {busy ? 'Creando…' : 'Crear'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setCreating(false)}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

/**
 * @param {{ teamId: number, available: any[], onAdd: (teamId: number, userHeroId: number) => void }} props
 */
function AddHeroRow({ teamId, available, onAdd }) {
    const [selected, setSelected] = useState('');
    const submit = () => {
        if (!selected) return;
        onAdd(teamId, Number(selected));
        setSelected('');
    };
    return (
        <div className="add-hero-row">
            <select
                aria-label="Elige un héroe"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
            >
                <option value="">— Añadir héroe —</option>
                {available.map((uh) => (
                    <option value={uh.id} key={uh.id}>
                        {uh.Hero?.name || `Héroe #${uh.hero_id}`}
                    </option>
                ))}
            </select>
            <button
                type="button"
                className="btn btn-sm"
                onClick={submit}
                disabled={!selected}
            >
                Añadir
            </button>
        </div>
    );
}

export default TeamsPage;
