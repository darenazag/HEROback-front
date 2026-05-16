import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * @file hooks/useFetch.js
 * @description Hook genérico para lanzar una llamada async (típicamente a
 * la API) y exponer su estado: { data, error, loading, refresh }.
 *
 * - Cancela actualizaciones de estado si el componente se desmonta.
 * - Reejecuta cuando cambia cualquier elemento de `deps`.
 * - Expone `refresh()` para reintentar manualmente.
 *
 * @template T
 * @param {() => Promise<T>} fn
 * @param {React.DependencyList} [deps]
 * @returns {{ data: T | null, error: Error | null, loading: boolean, refresh: () => void }}
 */
export function useFetch(fn, deps = []) {
    const [data, setData] = useState(/** @type {T|null} */ (null));
    const [error, setError] = useState(/** @type {Error|null} */ (null));
    const [loading, setLoading] = useState(true);
    const [tick, setTick] = useState(0);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        fn()
            .then((result) => {
                if (cancelled || !mountedRef.current) return;
                setData(result);
            })
            .catch((err) => {
                if (cancelled || !mountedRef.current) return;
                setError(err instanceof Error ? err : new Error(String(err)));
            })
            .finally(() => {
                if (cancelled || !mountedRef.current) return;
                setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, tick]);

    const refresh = useCallback(() => setTick((t) => t + 1), []);

    return { data, error, loading, refresh };
}

export default useFetch;
