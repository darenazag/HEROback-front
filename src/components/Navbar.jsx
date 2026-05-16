import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';

/**
 * @file components/Navbar.jsx
 * @description Barra de navegación superior. Muestra enlaces distintos
 * según haya o no usuario en sesión y según su rol.
 */
function Navbar() {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const close = () => setOpen(false);
    const handleLogout = () => {
        logout();
        close();
        navigate('/');
    };

    return (
        <nav className="navbar" aria-label="Principal">
            <div className="navbar-inner">
                <NavLink to="/" className="navbar-brand" onClick={close}>
                    <span aria-hidden>⚡</span> HEROback
                </NavLink>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <ThemeToggle />
                    <button
                        type="button"
                        className="nav-toggle"
                        aria-label="Abrir menú"
                        aria-expanded={open}
                        onClick={() => setOpen((v) => !v)}
                    >
                        ☰
                    </button>
                </div>

                <ul id="nav-menu" className={`nav-links${open ? ' open' : ''}`}>
                    <li><NavLink to="/heroes" onClick={close}>Héroes</NavLink></li>
                    <li><NavLink to="/store" onClick={close}>Tienda</NavLink></li>
                    {user && (
                        <>
                            <li><NavLink to="/teams" onClick={close}>Mis equipos</NavLink></li>
                            <li><NavLink to="/dashboard" onClick={close}>Dashboard</NavLink></li>
                            {user.role === 'admin' && (
                                <li>
                                    <NavLink to="/admin" className="admin-link" onClick={close}>
                                        ⚙ Admin
                                    </NavLink>
                                </li>
                            )}
                            <li>
                                <a href="#logout" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                                    Salir
                                </a>
                            </li>
                        </>
                    )}
                    {!user && (
                        <>
                            <li><NavLink to="/login" onClick={close}>Iniciar sesión</NavLink></li>
                            <li><NavLink to="/register" onClick={close}>Registrarse</NavLink></li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
