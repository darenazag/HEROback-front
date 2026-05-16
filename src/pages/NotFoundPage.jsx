import { Link } from 'react-router-dom';

/**
 * @file pages/NotFoundPage.jsx
 */
function NotFoundPage() {
    return (
        <div className="container">
            <div className="empty-state">
                <h1>404</h1>
                <p>Página no encontrada</p>
                <Link to="/" className="btn" style={{ marginTop: '1rem' }}>Volver al inicio</Link>
            </div>
        </div>
    );
}

export default NotFoundPage;
