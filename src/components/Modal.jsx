import { useEffect } from 'react';

/**
 * @file components/Modal.jsx
 * @description Modal de propósito general. Cierra con Escape o clic en
 * el backdrop. Bloquea el scroll del body mientras está abierto.
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   title?: string,
 *   children?: React.ReactNode,
 * }} props
 */
function Modal({ open, onClose, title, children }) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [open, onClose]);

    if (!open) return null;
    return (
        <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                {title && <h2>{title}</h2>}
                {children}
            </div>
        </div>
    );
}

export default Modal;
