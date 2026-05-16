import { createContext, useCallback, useContext, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage.js';

/**
 * @file context/ThemeContext.jsx
 * @description Tema visual: 'dark' (por defecto, coherente con el backend
 * actual) o 'light' (claro). Se aplica via `data-theme` en el <html>, lo
 * que activa el bloque correspondiente de CSS variables en `theme.css`.
 *
 * Persiste la elección en localStorage. Si el usuario no ha escogido
 * todavía, sigue al sistema vía `prefers-color-scheme`.
 *
 * @typedef {'dark' | 'light'} ThemeName
 */

/**
 * @type {React.Context<{ theme: ThemeName, toggle: () => void, setTheme: (t: ThemeName) => void }>}
 */
const ThemeContext = createContext(/** @type {any} */ (null));

const THEME_KEY = 'heroback:theme';

/**
 * Detecta el tema preferido del sistema operativo.
 * @returns {ThemeName}
 */
function detectSystemTheme() {
    if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/** @param {{ children: React.ReactNode }} props */
export function ThemeProvider({ children }) {
    const [theme, setTheme] = useLocalStorage(THEME_KEY, detectSystemTheme());

    // Aplicar el atributo en <html> cada vez que cambia
    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
        // Actualizar también el meta theme-color para la barra del móvil
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.setAttribute('content', theme === 'dark' ? '#0f0f1a' : '#faf9f7');
        }
    }, [theme]);

    const toggle = useCallback(() => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    }, [setTheme]);

    return (
        <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

/**
 * @returns {{ theme: ThemeName, toggle: () => void, setTheme: (t: ThemeName) => void }}
 */
export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
    return ctx;
}
