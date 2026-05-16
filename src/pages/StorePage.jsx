import { useState } from 'react';
import { useFetch } from '../hooks/useFetch.js';
import { getProducts, buyProduct } from '../api/resources.js';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * @file pages/StorePage.jsx
 * @description Tienda de productos. Permite comprar usando coins del
 * usuario logueado.
 */
function StorePage() {
    const { user, updateUser } = useAuth();
    const { data, loading, error, refresh } = useFetch(getProducts, []);
    const [feedback, setFeedback] = useState(/** @type {{type:'ok'|'err', text:string}|null} */(null));
    const [busyId, setBusyId] = useState(/** @type {number|null} */(null));

    const products = data?.data || [];

    const onBuy = async (productId) => {
        if (!user) return;
        setBusyId(productId);
        setFeedback(null);
        try {
            const res = await buyProduct({ productId, quantity: 1 });
            if (res.user?.coins != null) updateUser({ coins: res.user.coins });
            refresh();
            setFeedback({ type: 'ok', text: 'Compra realizada con éxito.' });
        } catch (err) {
            setFeedback({ type: 'err', text: err.message });
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="container">
            <div className="section-header">
                <h1>Tienda</h1>
                {user && (
                    <p className="muted">
                        Saldo: <strong style={{ color: 'var(--accent)' }}>{user.coins} coins</strong>
                    </p>
                )}
            </div>

            {feedback && (
                <div className={`alert ${feedback.type === 'ok' ? 'alert-success' : 'alert-error'}`}>
                    {feedback.text}
                </div>
            )}

            {loading && <div className="empty-state"><p>Cargando productos…</p></div>}
            {error && <div className="alert alert-error">{error.message}</div>}

            <div className="product-grid">
                {products.map((p) => (
                    <article className="product-card" key={p.id}>
                        <h3>{p.name}</h3>
                        <p className="description">{p.description}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span className="price">{p.price} <span style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>coins</span></span>
                            <span className="stock">Stock: {p.stock}</span>
                        </div>
                        {user ? (
                            <button
                                type="button"
                                className="btn btn-accent"
                                onClick={() => onBuy(p.id)}
                                disabled={p.stock === 0 || busyId === p.id || (user.coins ?? 0) < p.price}
                            >
                                {p.stock === 0
                                    ? 'Agotado'
                                    : (user.coins ?? 0) < p.price
                                        ? 'Sin coins'
                                        : busyId === p.id
                                            ? 'Comprando…'
                                            : 'Comprar'}
                            </button>
                        ) : (
                            <p className="muted">Inicia sesión para comprar</p>
                        )}
                    </article>
                ))}
            </div>
        </div>
    );
}

export default StorePage;
