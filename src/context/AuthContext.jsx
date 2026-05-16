import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getToken, setToken } from '../api/client.js';
import * as Resources from '../api/resources.js';

/**
 * @file context/AuthContext.jsx
 * @description Provee el estado de autenticación a toda la app.
 *
 * Persiste el token y el usuario en localStorage para sobrevivir a recargas.
 * Cuando se monta, intenta rehidratar el perfil pidiendo `/api/auth/me`.
 *
 * @typedef {{ id: number, username: string, email: string, role: 'admin'|'user', coins?: number }} User
 */

/**
 * @type {React.Context<{
 *   user: User|null,
 *   loading: boolean,
 *   login: (creds: { email: string, password: string }) => Promise<User>,
 *   register: (data: { username: string, email: string, password: string }) => Promise<User>,
 *   logout: () => void,
 *   updateUser: (patch: Partial<User>) => void,
 * }>}
 */
const AuthContext = createContext(/** @type {any} */ (null));

const USER_KEY = 'heroback:user';

/** @param {{ children: React.ReactNode }} props */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(/** @type {User|null} */ (null));
    const [loading, setLoading] = useState(true);

    // Rehidratación inicial
    useEffect(() => {
        const token = getToken();
        let cancelled = false;

        // Cache local del usuario (UI más responsiva)
        try {
            const raw = localStorage.getItem(USER_KEY);
            if (raw) setUser(JSON.parse(raw));
        } catch {
            /* ignore */
        }

        if (!token) {
            setLoading(false);
            return;
        }

        Resources.getProfile()
            .then((profile) => {
                if (cancelled) return;
                setUser(profile);
                try {
                    localStorage.setItem(USER_KEY, JSON.stringify(profile));
                } catch {
                    /* ignore */
                }
            })
            .catch(() => {
                if (cancelled) return;
                // Token caducado o inválido
                setToken(null);
                localStorage.removeItem(USER_KEY);
                setUser(null);
            })
            .finally(() => {
                if (cancelled) return;
                setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const login = useCallback(async ({ email, password }) => {
        const { token, user: u } = await Resources.login({ email, password });
        setToken(token);
        setUser(u);
        try {
            localStorage.setItem(USER_KEY, JSON.stringify(u));
        } catch {
            /* ignore */
        }
        return u;
    }, []);

    const register = useCallback(async (payload) => {
        await Resources.register(payload);
        return login({ email: payload.email, password: payload.password });
    }, [login]);

    const logout = useCallback(() => {
        setToken(null);
        localStorage.removeItem(USER_KEY);
        setUser(null);
    }, []);

    const updateUser = useCallback((patch) => {
        setUser((prev) => {
            if (!prev) return prev;
            const next = { ...prev, ...patch };
            try {
                localStorage.setItem(USER_KEY, JSON.stringify(next));
            } catch {
                /* ignore */
            }
            return next;
        });
    }, []);

    const value = { user, loading, login, register, logout, updateUser };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * @returns {{
 *   user: User|null,
 *   loading: boolean,
 *   login: (creds: { email: string, password: string }) => Promise<User>,
 *   register: (data: { username: string, email: string, password: string }) => Promise<User>,
 *   logout: () => void,
 *   updateUser: (patch: Partial<User>) => void,
 * }}
 */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
    return ctx;
}
