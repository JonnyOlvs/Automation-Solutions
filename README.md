# Automation Solutions — QA Automation Platform

Plataforma central de **QA Automation** para administrar clientes, proyectos, ejecuciones, evidencias, reportes y documentación desde un único dashboard multi-cliente. Incluye además el framework base de automatización E2E con **Playwright + TypeScript + Percy + Allure**, que alimenta al dashboard con ejecuciones reales.

Corre 100% local por ahora. Está preparada para desplegarse después detrás de **Cloudflare** en un dominio propio (frontend estático en Cloudflare Pages, backend independiente detrás de Cloudflare como proxy/CDN).

## Estructura del repositorio

```text
Automation Solutions/
├── src/                    Framework Playwright: Page Objects + specs E2E/visual
├── config/                 playwright.config.ts, percy.config.ts, currents.config.ts
├── scripts/                run-with-evidences.cjs (corre Playwright y guarda evidencias)
├── data/                   Datos de ejemplo sueltos del framework Playwright
├── evidencias/             Evidencias reales generadas por cada corrida (screenshots, videos, trace, logs, reportes)
├── allure-results/         Resultados crudos de Allure
├── reports/                Reportes HTML (Playwright / Allure)
├── test-results/           Salida nativa de Playwright
├── backend/                API del dashboard (Express + TS) — ver backend/README implícito abajo
│   └── src/
│       ├── modules/        Rutas/servicios por dominio (clients, projects, executions, evidences, reports, documents, integrations, dashboard, auth)
│       ├── data/mock/       Datos simulados (clientes Alpha/Beta/Gamma) generados por scripts/generate-mock.cjs
│       └── lib/             Repositorio genérico (FileRepository) + puente con evidencias/ de Playwright
└── frontend/                Dashboard web (React + Vite + TypeScript + Tailwind + shadcn/ui)
    └── src/
        ├── components/      UI (botones, cards, tabs, tablas, gráficas) + layout (Sidebar/TopBar)
        ├── modules/          Una carpeta por sección del dashboard
        ├── api/              Cliente HTTP tipado hacia el backend
        └── store/            Estado global (filtros Cliente→Proyecto→Ambiente→Suite, rol simulado, vista Ejecutiva/Técnica)
```

## Cómo correr todo en local

```bash
npm install          # instala dependencias raíz + backend + frontend (postinstall)
npm run dev          # backend en :4000 y frontend en :5173, en paralelo
```

Abrir [http://localhost:5173](http://localhost:5173).

También se puede correr cada parte por separado:

```bash
npm run dev:backend   # solo API (http://localhost:4000)
npm run dev:frontend  # solo dashboard (http://localhost:5173, proxy /api y /static hacia el backend)
```

Para regenerar los datos mock (clientes/proyectos/ejecuciones simulados):

```bash
cd backend
npm run generate:mock
```

## Arquitectura del dashboard (resumen)

- **Multi-cliente por diseño**: Cliente → Proyecto → Ambiente → Suite → Ejecución. El mismo dashboard sirve para todos los clientes; nada de la UI cambia, solo los datos filtrados.
- **Repositorio reemplazable**: el backend lee hoy de archivos JSON (`backend/src/data/mock`) a través de `FileRepository`. El día que exista PostgreSQL, se implementa una `PostgresRepository` con la misma interfaz y ni rutas ni frontend cambian.
- **Puente con Playwright real**: `backend/src/lib/playwrightBridge.ts` escanea `evidencias/` (generada por `scripts/run-with-evidences.cjs` en cada corrida real) y la mezcla con los datos mock, así que las ejecuciones reales aparecen automáticamente en el "Centro de Ejecuciones" y en "Evidencias".
- **GitHub / GitHub Actions**: integración desacoplada (`backend/src/modules/integrations/github.provider.ts`) con un `MockGithubProvider`. Se reemplaza por un `OctokitGithubProvider` real sin tocar rutas ni pantallas.
- **Roles y autenticación real (ligera)**: login con email + password (hash bcrypt en `backend/src/data/mock/credentials.json`), sesiones en memoria vía token Bearer (`backend/src/lib/auth.ts`, expiran a las 12h). Toda la API (excepto `/api/auth/login`) requiere sesión válida. Si el usuario logueado es rol `client`, el backend fuerza `clientId` en cada consulta y responde 403 si intenta acceder a datos de otro cliente por `:id` directo — aislamiento real, no solo de interfaz. Ver sección "Demo cliente" más abajo.
- **Vista Ejecutiva vs Técnica**: switch en la barra superior; la vista ejecutiva resume el estado del proyecto para el cliente, la vista técnica expone KPIs y gráficas detalladas para el equipo de QA.

## Framework Playwright (E2E)

Framework base reutilizable para automatización E2E con Playwright + TypeScript + Percy + Allure.

### Enfoque

- Specs claros y directos con `@playwright/test`.
- Page Objects con `fields` (selectores) dentro de cada clase.
- Configuración por ambiente en `.env`.

### Variables de entorno

Copiar `.env.local-regresion.example` a `.env` y ajustar valores:

- `TEST_ENV=dev|qa|prod`
- `BASE_URL_DEV`, `BASE_URL_QA`, `BASE_URL_PROD`
- `HEADLESS`, `RETRIES`, `WORKERS`
- `PERCY_TOKEN`

### Scripts de Playwright

- `npm run test` — todos los tests.
- `npm run test:headed` — tests con navegador visible.
- `npm run test:visual` — solo visual tests.
- `npm run test:chrome` — solo Chromium.
- `npm run test:debug` — modo debug.
- `npm run test:dash` — corre Playwright y guarda evidencias en `evidencias/` (alimenta el dashboard).
- `npm run test:ci:dash` — igual que `test:dash` pero con el filtro de CI (`--grep-invert "@visual|@zerimar"`); es el que usa el workflow de GitHub Actions y el que sube evidencias a Cloudflare R2 si hay credenciales configuradas.
- `npm run test:zerimar:dash` — corre solo el smoke real contra `zerimarsoftware.com` (tag `@zerimar`) y guarda sus evidencias como proyecto "Zerimar" (ver sección "Demo cliente: Zerimar Software").
- `npm run report` — abrir reporte Playwright.
- `npm run report:allure` / `report:allure:open` — reporte HTML de Allure.

### CI/CD

Workflows en `.github/workflows/automation.yml` y `.github/workflows/percy-smoke.yml`: ejecutan en `push`, `pull_request` y `workflow_dispatch`, corren tests E2E + visuales (Percy) y publican reportes Playwright + Allure.

## Despliegue en `automatedsolutionsgroup.org`

Arquitectura objetivo: **frontend en Cloudflare Pages**, **backend en un PaaS externo** (Render/Railway/Fly.io) con Cloudflare solo como DNS/proxy, y **evidencias de CI en Cloudflare R2** (las corridas de GitHub Actions son efímeras, así que sus evidencias se suben a R2 en vez de quedar solo en el runner).

```
app.automatedsolutionsgroup.org          -> Cloudflare Pages (frontend)
api.automatedsolutionsgroup.org          -> proxy Cloudflare -> backend (Render, etc.)
evidencias.automatedsolutionsgroup.org   -> Cloudflare R2 (bucket con dominio propio)
```

Cómo fluye una corrida disparada desde GitHub Actions hasta el dashboard:

1. El workflow corre `npm run test:ci:dash` (Playwright + `scripts/run-with-evidences.cjs`), que genera `evidencias/<proyecto>/.../execId/` igual que en local, con `branch`/`commit` reales tomados de `GITHUB_REF_NAME`/`GITHUB_SHA`.
2. Ese mismo script sube esa carpeta a Cloudflare R2 (`scripts/lib/r2Upload.cjs`) si las variables `R2_*` están configuradas como Secrets del repo.
3. El backend desplegado (`backend/src/lib/ciEvidenceBridge.ts`) hace polling periódico sobre ese bucket (cada 30s por defecto) y fusiona esas ejecuciones/evidencias/reportes con los datos mock y con lo que haya en disco local — sin necesitar base de datos.
4. El frontend consulta la API vía `VITE_API_BASE_URL` y muestra las evidencias con URLs absolutas hacia `evidencias.automatedsolutionsgroup.org`.

### 1. Cloudflare: R2 para evidencias

1. Cloudflare Dashboard → **R2** → crear bucket, ej. `automation-solutions-evidencias`.
2. Bucket → **Settings → Custom Domains** → conectar `evidencias.automatedsolutionsgroup.org` (deja el bucket accesible públicamente bajo ese dominio, solo lectura de archivos).
3. **R2 → Manage API tokens** → crear un token con permiso de **lectura y escritura** sobre ese bucket (se usará tanto desde GitHub Actions para subir, como desde el backend para leer). Guarda `Access Key ID`, `Secret Access Key` y el `Account ID`.

### 2. GitHub: Secrets del repositorio

En `Settings → Secrets and variables → Actions` del repo [`JonnyOlvs/Automation-Solutions`](https://github.com/JonnyOlvs/Automation-Solutions), agregar:

| Secret | Valor |
| --- | --- |
| `R2_ACCOUNT_ID` | Account ID de Cloudflare |
| `R2_ACCESS_KEY_ID` | Access Key del token R2 |
| `R2_SECRET_ACCESS_KEY` | Secret Key del token R2 |
| `R2_BUCKET` | `automation-solutions-evidencias` |

Sin estos Secrets, el workflow sigue corriendo igual (solo se omite la subida a R2 y las evidencias quedan únicamente como artefacto descargable del run).

### 3. Backend: desplegar en un PaaS (ej. Render)

1. Crear un **Web Service** apuntando al repo, *Root Directory* `backend`, *Build Command* `npm install && npm run build`, *Start Command* `npm start`.
2. Variables de entorno del servicio: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL=https://evidencias.automatedsolutionsgroup.org` (ver `backend/.env.example`).
3. En Cloudflare DNS, crear un `CNAME api → <tu-servicio>.onrender.com` con el proxy naranja activado (esto le da TLS y el dominio propio sin tocar el backend).

### 4. Frontend: Cloudflare Pages

1. Cloudflare Dashboard → **Workers & Pages → Create → Pages → conectar el repo**.
2. *Root directory* `frontend`, *Build command* `npm run build`, *Output directory* `dist`.
3. Variable de entorno del build: `VITE_API_BASE_URL=https://api.automatedsolutionsgroup.org/api` (ver `frontend/.env.production.example`).
4. **Custom domains** del proyecto → agregar `app.automatedsolutionsgroup.org` (o el dominio raíz, según prefieras).

### Notas

- Los workflows siguen siendo manuales (`workflow_dispatch`); no se disparan automáticamente en `push`/`pull_request`.
- Los datos "de catálogo" (clientes/proyectos/ambientes) siguen en JSON local dentro del repo (`backend/src/data/mock`); solo las **ejecuciones reales** viajan por R2. Migrar a PostgreSQL queda para una siguiente fase.
- `GET /api/integrations/ci-evidence/status` y `POST /api/integrations/ci-evidence/refresh` permiten revisar si el backend está viendo R2 y forzar un refresco manual sin esperar el polling.

## Demo cliente: Zerimar Software

Cliente demo con login real, branding propio (logo en `frontend/public/logos/zerimar.png`) y evidencias **reales** de Playwright corridas contra `https://zerimarsoftware.com/` (no son mock).

- **URL de login**: `/login` (redirige automáticamente si no hay sesión).
- **Usuario**: `zerimarsoftware@automationsolutions.org`
- **Password**: `zerimaradmin`
- Cuentas internas (Alpha/Beta/Gamma + equipo) usan la password compartida `automation2026` (ver `backend/scripts/generate-credentials.cjs`).

Al hacer login como Zerimar, el dashboard fuerza `clientId=cli-zerimar` en toda la API (backend), oculta el selector de "Cliente" en la barra superior y muestra el logo/nombre de Zerimar en el sidebar en vez del branding de Automated Solutions.

### Generar más evidencias reales de Zerimar

```bash
npm run test:zerimar:dash
```

Corre el spec `src/tests/e2e/zerimar.spec.ts` (tag `@zerimar`, excluido de `npm run test`/`test:ci`) contra el sitio real, y guarda screenshots/video/trace/reporte en `evidencias/Zerimar/...` — el backend los detecta automáticamente (mismo puente que usa Playwright para el resto de clientes, `PROJECT_NAME_MAP` en `backend/src/lib/playwrightBridge.ts`).

### Agregar un nuevo cliente demo (receta rápida)

1. Agregar entradas en `CLIENTS`, `PROJECTS`, `MODULES_BY_PROJECT` y `USERS` en `backend/scripts/generate-mock.cjs` (incluir `logoUrl`/`primaryColor` en el cliente) y correr `npm run generate:mock` dentro de `backend/`.
2. Correr `npm run generate:credentials` dentro de `backend/` para regenerar `credentials.json` con el password que corresponda (ver `PASSWORD_OVERRIDES` en el script).
3. Si vas a correr Playwright real contra su sitio, agregar su entrada a `PROJECT_NAME_MAP` en `backend/src/lib/playwrightBridge.ts` y un spec tageado (ej. `@nuevocliente`) que navegue a su URL real.
4. Copiar su logo a `frontend/public/logos/<slug>.png`.

## Roadmap pendiente

- Integración real con GitHub API + GitHub Actions.
- Exportación a PDF / Excel de reportes y evidencias.
- Persistencia en PostgreSQL en lugar de los repositorios JSON.
- Disparo automático del pipeline en `push`/`pull_request` (hoy solo manual).
