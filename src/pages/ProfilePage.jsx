import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { updateProfile } from '../api/resources.js';

/**
 * @file pages/ProfilePage.jsx
 * @description Edición de username y email del usuario logueado.
 */
function ProfilePage() {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({
        username: user?.username || '',
        email: user?.email || '',
    });
    const [msg, setMsg] = useState(/** @type {{ type: 'ok'|'err', text: string }|null} */(null));
    const [submitting, setSubmitting] = useState(false);

    if (!user) return null;

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMsg(null);
        try {
            const updated = await updateProfile(user.id, form);
            updateUser({ username: updated.username, email: updated.email });
            setMsg({ type: 'ok', text: 'Perfil actualizado correctamente.' });
        } catch (err) {
            setMsg({ type: 'err', text: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container auth-wrap">
            <div className="auth-card">
                <h1>Mi perfil</h1>
                <p className="muted">Actualiza tus datos de cuenta.</p>

                {msg && (
                    <div className={`alert ${msg.type === 'ok' ? 'alert-success' : 'alert-error'}`}>
                        {msg.text}
                    </div>
                )}

                <form onSubmit={submit}>
                    <div className="form-group">
                        <label htmlFor="username">Nombre de usuario</label>
                        <input
                            id="username"
                            type="text"
                            required
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn" disabled={submitting}>
                        {submitting ? 'Guardando…' : 'Guardar cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ProfilePage;
