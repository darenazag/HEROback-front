import { useEffect, useState } from 'react';

/**
 * @file hooks/useDebounce.js
 * @description Retorna `value` con un retardo. Útil para inputs de búsqueda:
 * evita disparar una petición a la API en cada pulsación.
 *
 * @template T
 * @param {T} value
 * @param {number} [delay=350]
 * @returns {T}
 */
export function useDebounce(value, delay = 350) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export default useDebounce;
