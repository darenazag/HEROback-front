/**
 * @file api/client.js
 * @description Cliente fetch centralizado para la API de HEROback.
 *
 * Funcionalidades:
 *  - Inyecta automáticamente el JWT desde localStorage en cabecera
 *    Authorization.
 *  - Serializa/deserializa JSON.
 *  - Lanza un objeto Error con .status y .data en caso de respuesta no-OK,
 *    para que los componentes puedan reaccionar al código.
 *  - Expone helpers: get, post, patch, del.
 *
 * El proxy de Vite reenvía `/api/*` al backend (http://localhost:3000),
 * por lo que las URLs aquí pueden ser siempre relativas.
 */

const TOKEN_KEY = 'token';

/**
 * Obtiene el token guardado por la sesión.
 * @returns {string|null}
 */
export function getToken() {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

/**
 * Persiste el token de la sesión actual.
 * @param {string|null} token
 */
export function setToken(token) {
    try {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        else localStorage.removeItem(TOKEN_KEY);
    } catch {
        /* ignore */
    }
}

/**
 * Wrapper de fetch con manejo de errores uniformes.
 *
 * @param {string} path  Path relativo (ej. "/api/heroes").
 * @param {RequestInit & { body?: any }} [options]
 * @returns {Promise<any>}
 * @throws {Error & { status?: number, data?: any }}
 */
export async function request(path, options = {}) {
    const token = getToken();
    /** @type {Record<string, string>} */
    const headers = {
        Accept: 'application/json',
        ...(options.headers || {}),
    };

    let body = options.body;
    if (body && typeof body === 'object' && !(body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(body);
    }
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(path, { ...options, body, headers });

    // 204 No Content
    if (res.status === 204) return null;

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const payload = isJson ? await res.json().catch(() => null) : await res.text();

    if (!res.ok) {
        const err = new Error(
            (isJson && payload && payload.error) ||
                `Error ${res.status} en ${path}`,
        );
        // @ts-expect-error: enriching the error with HTTP context
        err.status = res.status;
        // @ts-expect-error
        err.data = payload;
        throw err;
    }

    return payload;
}

export const api = {
    /** @param {string} path */
    get: (path) => request(path, { method: 'GET' }),
    /** @param {string} path @param {any} [body] */
    post: (path, body) => request(path, { method: 'POST', body }),
    /** @param {string} path @param {any} [body] */
    patch: (path, body) => request(path, { method: 'PATCH', body }),
    /** @param {string} path */
    del: (path) => request(path, { method: 'DELETE' }),
};

export default api;
