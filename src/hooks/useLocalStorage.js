import { useCallback, useEffect, useState } from 'react';

/**
 * @file hooks/useLocalStorage.js
 * @description Hook que sincroniza un valor con localStorage.
 *
 * Garantías:
 *  - SSR-safe (lee diferido en useEffect).
 *  - Re-render automático cuando otro tab cambia la misma clave.
 *  - Acepta función como nuevo valor (igual que useState).
 *
 * @template T
 * @param {string} key
 * @param {T} initialValue
 * @returns {[T, (value: T | ((prev: T) => T)) => void, () => void]}
 */
export function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(initialValue);

    // Hidratar tras montar
    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(key);
            if (raw !== null) setValue(JSON.parse(raw));
        } catch {
            /* clave corrupta o no parseable: nos quedamos con el inicial */
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    // Sincronizar con otras pestañas
    useEffect(() => {
        /** @param {StorageEvent} e */
        const onStorage = (e) => {
            if (e.key !== key) return;
            try {
                setValue(e.newValue === null ? initialValue : JSON.parse(e.newValue));
            } catch {
                /* ignore */
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const update = useCallback(
        (next) => {
            setValue((prev) => {
                const resolved = typeof next === 'function' ? next(prev) : next;
                try {
                    window.localStorage.setItem(key, JSON.stringify(resolved));
                } catch {
                    /* quota / disabled */
                }
                return resolved;
            });
        },
        [key],
    );

    const remove = useCallback(() => {
        try {
            window.localStorage.removeItem(key);
        } catch {
            /* ignore */
        }
        setValue(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return [value, update, remove];
}

export default useLocalStorage;
