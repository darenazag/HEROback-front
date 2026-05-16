/**
 * @file api/resources.js
 * @description Funciones específicas por recurso del backend.
 * Todas devuelven Promises y propagan errores enriquecidos del client.
 */
import { api } from './client.js';

/* ───────── Auth ───────── */

/** @param {{ email: string, password: string }} payload */
export const login = (payload) => api.post('/api/auth/login', payload);

/** @param {{ username: string, email: string, password: string }} payload */
export const register = (payload) => api.post('/api/auth/register', payload);

/** Perfil del usuario actual. Requiere token. */
export const getProfile = () => api.get('/api/auth/me');

/* ───────── Heroes ───────── */

/**
 * @param {{ page?: number, limit?: number, alignment?: string, publisher?: string, search?: string, sort?: string }} [params]
 */
export function getHeroes(params = {}) {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.alignment) q.set('alignment', params.alignment);
    if (params.publisher) q.set('publisher__like', params.publisher);
    if (params.search) q.set('name__like', params.search);
    if (params.sort) q.set('sort', params.sort);
    const qs = q.toString();
    return api.get(`/api/heroes${qs ? `?${qs}` : ''}`);
}

/** @param {number|string} id */
export const getHero = (id) => api.get(`/api/heroes/${id}`);

/** URL del proxy de imagen para usar en src de <img>. */
export const heroImageUrl = (id) => `/api/heroes/${id}/image`;

/** Colección personal del usuario logueado. */
export const getMyHeroes = () => api.get('/api/heroes/mis-heroes');

/* ───────── Store / colección ───────── */

/** @param {number} heroId */
export const addHeroToCollection = (heroId) =>
    api.post('/api/store/add-hero', { heroId });

/** Lista de productos. */
export const getProducts = () => api.get('/api/products');

/** @param {{ productId: number, quantity?: number }} payload */
export const buyProduct = (payload) => api.post('/api/store/buy', payload);

/** Historial de compras del usuario. */
export const getMyPurchases = () => api.get('/api/store/my-purchases');

/* ───────── Teams ───────── */

export const getMyTeams = () => api.get('/api/teams');

/** @param {string} name */
export const createTeam = (name) => api.post('/api/teams', { name });

/** @param {number} teamId */
export const deleteTeam = (teamId) => api.del(`/api/teams/${teamId}`);

/** @param {number} teamId @param {number} userHeroId */
export const addHeroToTeam = (teamId, userHeroId) =>
    api.post(`/api/teams/${teamId}/heroes`, { userHeroId });

/** @param {number} teamId @param {number} userHeroId */
export const removeHeroFromTeam = (teamId, userHeroId) =>
    api.del(`/api/teams/${teamId}/heroes/${userHeroId}`);

/* ───────── User profile ───────── */

/**
 * Actualiza el perfil del propio usuario. El backend valida que sólo
 * se pueda editar al user_id de la sesión (salvo admin).
 *
 * @param {number} userId  ID del usuario logueado.
 * @param {{ username?: string, email?: string }} payload
 */
export const updateProfile = (userId, payload) =>
    api.patch(`/api/users/${userId}`, payload);
