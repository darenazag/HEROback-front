import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * @file pages/RegisterPage.jsx
 */
function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState(/** @type {string|null} */(null));
    const [submitting, setSubmitting] = useState(false);

    const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setError(null);
        if (form.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        setSubmitting(true);
        try {
            await register(form);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container auth-wrap">
            <div className="auth-card">
                <h1>Crear cuenta</h1>
                <p className="muted">Únete y empieza tu colección.</p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={submit} noValidate>
                    <div className="form-group">
                        <label htmlFor="username">Nombre de usuario</label>
                        <input
                            id="username"
                            type="text"
                            required
                            minLength={3}
                            value={form.username}
                            onChange={update('username')}
                            autoComplete="username"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={form.email}
                            onChange={update('email')}
                            autoComplete="email"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            required
                            minLength={6}
                            value={form.password}
                            onChange={update('password')}
                            autoComplete="new-password"
                        />
                    </div>

                    <button type="submit" className="btn" disabled={submitting}>
                        {submitting ? 'Creando…' : 'Registrarse'}
                    </button>
                </form>

                <p className="form-footer">
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;
