import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import HomePage from './pages/HomePage.jsx';
import HeroesPage from './pages/HeroesPage.jsx';
import HeroDetailPage from './pages/HeroDetailPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import TeamsPage from './pages/TeamsPage.jsx';
import StorePage from './pages/StorePage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

/**
 * @file App.jsx
 * @description Raíz de la app. Encadena providers (tema + auth) y monta el
 * router. Cada ruta protegida se envuelve en <ProtectedRoute />.
 */
function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <div className="app-shell">
                        <Navbar />
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/heroes" element={<HeroesPage />} />
                            <Route path="/heroes/:id" element={<HeroDetailPage />} />
                            <Route path="/store" element={<StorePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />

                            <Route
                                path="/dashboard"
                                element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
                            />
                            <Route
                                path="/perfil"
                                element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
                            />
                            <Route
                                path="/teams"
                                element={<ProtectedRoute><TeamsPage /></ProtectedRoute>}
                            />
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute requireRole="admin">
                                        <AdminPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                        <Footer />
                    </div>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
