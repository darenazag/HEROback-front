import { useTheme } from '../context/ThemeContext.jsx';

/**
 * @file components/ThemeToggle.jsx
 * @description Botón redondo que alterna entre tema oscuro y claro.
 * El estado se persiste en localStorage vía el ThemeProvider.
 */
function ThemeToggle() {
    const { theme, toggle } = useTheme();
    const isDark = theme === 'dark';
    return (
        <button
            type="button"
            className="theme-toggle"
            onClick={toggle}
            aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            title={isDark ? 'Tema claro' : 'Tema oscuro'}
        >
            <span aria-hidden>{isDark ? '☀' : '☾'}</span>
        </button>
    );
}

export default ThemeToggle;
