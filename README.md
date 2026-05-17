# HEROback — Frontend React
 
> Interfaz de usuario para la plataforma de superhéroes HEROback, construida con **React 18 + Vite 5**. Consume la API REST del backend HEROback (Express + PostgreSQL) y gestiona sesión, tema visual y filtros de forma persistente mediante `localStorage`.
 
---
 
## Índice
 
1. [Requisitos previos](#1-requisitos-previos)
2. [Estructura del proyecto](#2-estructura-del-proyecto)
3. [Instalación y puesta en marcha](#3-instalación-y-puesta-en-marcha)
4. [Conexión con el backend](#4-conexión-con-el-backend)
5. [Variables de entorno](#5-variables-de-entorno)
6. [Funcionalidades](#6-funcionalidades)
7. [Arquitectura interna](#7-arquitectura-interna)
8. [Uso de localStorage](#9-uso-de-localstorage)
9. [Cuentas de prueba](#12-cuentas-de-prueba)
10. [Solución de problemas](#13-solución-de-problemas)
---
 
## 1. Requisitos previos
 
| Herramienta | Versión mínima | Notas |
|---|---|---|
| Node.js | 18.x | Necesario para `fetch` nativo y ESM |
| npm | 9.x | Incluido con Node 18 |
| Backend HEROback | — | Debe estar corriendo antes de arrancar el front |
| PostgreSQL | 14+ | Solo lo necesita el backend |
 
> **Importante:** el backend HEROback debe estar operativo y haber completado el seed de héroes (`npm run seed` o `npm run seed:live`) antes de usar el frontend. Sin datos en la BD, el catálogo aparecerá vacío.
 
---
 
## 2. Estructura del proyecto
 
```
heroback-front/
├── public/
│   ├── favicon.svg          # Ícono de la app
│   └── placeholder.svg      # Imagen de fallback para héroes sin foto
├── src/
│   ├── api/
│   │   ├── client.js        # fetch wrapper: JWT, errores, serialización
│   │   └── resources.js     # Funciones por recurso (auth, heroes, teams…)
│   ├── components/
│   │   ├── Footer.jsx
│   │   ├── HeroCard.jsx     # Tarjeta individual de héroe
│   │   ├── HeroGrid.jsx     # Grid con skeletons y estado vacío
│   │   ├── Modal.jsx        # Modal genérico (Escape + clic exterior cierra)
│   │   ├── Navbar.jsx       # Barra de navegación responsiva
│   │   ├── ProtectedRoute.jsx  # Guard de ruta (auth + rol)
│   │   └── ThemeToggle.jsx  # Botón ☀/☾
│   ├── context/
│   │   ├── AuthContext.jsx  # useAuth: login, logout, register, updateUser
│   │   └── ThemeContext.jsx # useTheme: toggle, setTheme
│   ├── hooks/
│   │   ├── useDebounce.js   # Retrasa un valor (inputs de búsqueda)
│   │   ├── useFetch.js      # Wrapper async: data, error, loading, refresh()
│   │   └── useLocalStorage.js  # Estado sincronizado con localStorage
│   ├── pages/
│   │   ├── AdminPage.jsx    # Stats + gestión de usuarios (solo admin)
│   │   ├── DashboardPage.jsx
│   │   ├── HeroDetailPage.jsx  # Ficha completa + añadir a colección
│   │   ├── HeroesPage.jsx   # Catálogo con filtros, búsqueda y paginación
│   │   ├── HomePage.jsx     # Landing con héroes destacados
│   │   ├── LoginPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── ProfilePage.jsx  # Edición de usuario
│   │   ├── RegisterPage.jsx
│   │   ├── StorePage.jsx    # Tienda con compra de productos
│   │   └── TeamsPage.jsx    # Gestión completa de equipos y héroes
│   ├── styles/
│   │   ├── global.css       # Reset, layout, componentes base
│   │   └── theme.css        # Variables CSS modo oscuro / claro
│   ├── App.jsx              # Router + providers
│   └── main.jsx             # Entry point React
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── README.md
└── vite.config.js           # Proxy /api → backend, puerto 5173
```
 
---
 
## 3. Instalación y puesta en marcha
 
### Paso 1 — Clonar el proyecto
 
```bash
# Si clonas el repositorio:
git clone https://github.com/darenazag/HEROback-front.git
cd HEROback-front
```
 
### Paso 2 — Instalar dependencias
 
```bash
npm install
```
 
Esto instala únicamente tres dependencias de producción:
 
- `react` + `react-dom` 18
- `react-router-dom` 6

### Paso 3 — Asegurarse de que el backend está corriendo
 
```bash
# Desde el directorio del backend HEROback:
npm run dev
# → Express escuchando en http://localhost:3000
```
 
Si tu backend escucha en otro puerto, crea un archivo `.env` (ver sección 5).
 
### Paso 4 — Arrancar el frontend
 
```bash
npm run dev
```
 
Abre el navegador en **http://localhost:5173**.
 
El terminal mostrará algo como:
 
```
  VITE v5.x.x  ready in 300 ms
 
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```
 
---
 
## 4. Conexión con el backend
 
### Cómo funciona el proxy
 
Vite incluye un servidor de desarrollo con proxy inverso. Toda petición que empiece por `/api` se reenvía **automáticamente** al backend:
 
```
Navegador → localhost:5173/api/heroes
               ↓  (proxy Vite)
Backend  → localhost:3000/api/heroes
```
 
Esto elimina por completo los errores CORS en desarrollo, ya que el navegador ve un único origen (`localhost:5173`) para todo.
 
La configuración está en `vite.config.js`:
 
```js
server: {
  proxy: {
    '/api': {
      target: process.env.VITE_API_TARGET || 'http://localhost:3000',
      changeOrigin: true,
    },
  },
},
```
 
### Proxy de imágenes
 
Las imágenes de los héroes se sirven a través del endpoint `/api/heroes/:id/image` del propio backend. Este endpoint descarga la imagen del origen externo (superherodb.com) sin enviar cabecera `Referer`, evitando el bloqueo por hotlink-protection. El frontend **nunca apunta directamente** a URLs externas.
 
```jsx
// HeroCard.jsx
<img src={`/api/heroes/${hero.id}/image`} alt={hero.name} />
```
 
### Autenticación
 
El backend emite un JWT al hacer login. El cliente lo almacena en `localStorage` con la clave `token` y lo inyecta en todas las peticiones protegidas:
 
```
Authorization: Bearer <token>
```
 
No se usan cookies de sesión (el backend las usa para las vistas Pug legacy, pero la API REST solo requiere el header).
 
---
 
## 5. Variables de entorno
 
Copia `.env.example` a `.env` y ajusta si es necesario:
 
```bash
cp .env.example .env
```
 
| Variable | Por defecto | Descripción |
|---|---|---|
| `VITE_API_TARGET` | `http://localhost:3000` | URL base del backend HEROback |
 
> Las variables Vite deben empezar por `VITE_` para ser accesibles desde el código del cliente. La variable `VITE_API_TARGET` solo se lee desde `vite.config.js` (proceso Node) así que también puede omitir el prefijo si no la necesitas en el cliente.
 
---
 
## 6. Funcionalidades
 
### Públicas (sin login)
 
| Ruta | Descripción |
|---|---|
| `/` | Landing con 12 héroes destacados |
| `/heroes` | Catálogo paginado con búsqueda y filtros (alignment, publisher) |
| `/heroes/:id` | Ficha detallada con estadísticas en barras |
| `/store` | Listado de productos (compra requiere login) |
| `/login` | Formulario de inicio de sesión |
| `/register` | Formulario de registro |
 
### Requieren login
 
| Ruta | Descripción |
|---|---|
| `/dashboard` | Resumen de coins, héroes y equipos |
| `/perfil` | Edición de username y email |
| `/teams` | Gestión completa: crear equipos, añadir/quitar héroes (máx. 6) |
| `/heroes/:id` | Botón "Añadir a mi colección" |
| `/store` | Botón "Comprar" (descuenta coins) |
 
### Solo admin
 
| Ruta | Descripción |
|---|---|
| `/admin` | Estadísticas globales + tabla de usuarios con opción de eliminar |
 
---
 
## 7. Arquitectura interna
 
### Providers (App.jsx)
 
```
<ThemeProvider>          ← gestiona y persiste el tema visual
  <AuthProvider>         ← gestiona JWT, perfil de usuario y sesión
    <BrowserRouter>
      <Navbar />
      <Routes>…</Routes>
      <Footer />
    </BrowserRouter>
  </AuthProvider>
</ThemeProvider>
```
 
### Flujo de una petición autenticada
 
```
Componente
  └─ useFetch(fn)              ← hook personalizado
       └─ fn()                 ← función de resources.js
            └─ api.get(path)   ← client.js
                 ├─ getToken() ← lee localStorage
                 ├─ fetch(path, { headers: { Authorization: 'Bearer …' } })
                 └─ res.json() → dato | Error enriquecido con .status
```
 
### Rutas protegidas
 
`ProtectedRoute` comprueba `user` del `AuthContext`. Si no hay usuario redirige a `/login` con `state.from` para redirigir de vuelta tras autenticar. Acepta la prop `requireRole="admin"` para rutas exclusivas de administrador.
 
---
  
## 8. Uso de localStorage
 
| Clave | Tipo | Contenido | Gestionada por |
|---|---|---|---|
| `token` | `string` | JWT de la sesión | `api/client.js` |
| `heroback:user` | `JSON` | Objeto de usuario (cache) | `AuthContext` |
| `heroback:theme` | `string` | `"dark"` o `"light"` | `ThemeContext` + `useLocalStorage` |
| `heroback:filters` | `JSON` | `{ search, alignment, publisher }` | `HeroesPage` + `useLocalStorage` |
 
Los datos se leen al montar y se actualizan sincrónicamente en cada cambio. Si `localStorage` no está disponible (modo privado estricto, algunos navegadores), las operaciones se capturan silenciosamente y la app funciona solo en memoria.
 
---
 
 
## 9. Cuentas de prueba
 
Tras ejecutar `npm run seed` en el backend:
 
| Email | Contraseña | Rol |
|---|---|---|
| `admin@heroback.com` | `admin123` | admin |
| `demo@heroback.com` | `demo123` | user |
 
---
 
## 10. Solución de problemas
 
### Las imágenes no cargan
 
- Confirma que el backend está corriendo. Las imágenes pasan por `/api/heroes/:id/image`.
- Si ves `ERR_CONNECTION_REFUSED` en las peticiones `/api/*`, el backend no está activo o escucha en otro puerto → ajusta `VITE_API_TARGET` en `.env`.
### Error 401 en todas las peticiones protegidas
 
El token ha expirado o es inválido. Cierra sesión y vuelve a entrar. Si el problema persiste, borra `localStorage` manualmente: `localStorage.clear()` en la consola del navegador.
 
### Error de CORS en producción
 
En producción el proxy de Vite no existe. Debes configurar el proxy en tu servidor web (ver sección 11) o habilitar CORS en el backend añadiendo el dominio del frontend en la lista de orígenes permitidos.
 
### Página en blanco tras desplegar
 
Asegúrate de que el servidor sirve `index.html` para cualquier ruta no encontrada (SPA fallback). Ver ejemplo Nginx de la sección 11.
 
### `npm run dev` falla con `Error: Cannot find module`
 
Ejecuta `npm install` para asegurarte de que las dependencias están instaladas.

---

## Autor

- Darío Arenaza [GitHub](https://github.com/darenazag)