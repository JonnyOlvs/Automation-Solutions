# Automation Solutions - Base E2E Framework

Framework base reutilizable para automatización E2E con Playwright + TypeScript + Percy + Allure.

## Estructura (estilo simple similar a Regresion)

```text
src
├── pages
│   ├── home.page.ts
│   ├── login.page.ts
│   └── products.page.ts
└── tests
    ├── e2e
    │   ├── home.spec.ts
    │   ├── login.spec.ts
    │   └── products.spec.ts
    └── visual
        └── home.visual.spec.ts

config
├── playwright.config.ts
└── percy.config.ts

.github/workflows/automation.yml
.env.example
package.json
tsconfig.json
```

## Enfoque

- Specs claros y directos con `@playwright/test`.
- Page Objects con `fields` (selectores) dentro de cada clase.
- Sin capas adicionales de `fixtures`, `constants` o `types` para mantenerlo simple.
- Configuración por ambiente en `.env`.

## Instalación

```bash
npm install
npx playwright install
```

## Variables de entorno

Copiar `.env.example` a `.env` y ajustar valores:

- `TEST_ENV=dev|qa|prod`
- `BASE_URL_DEV`, `BASE_URL_QA`, `BASE_URL_PROD`
- `HEADLESS`, `RETRIES`, `WORKERS`
- `PERCY_TOKEN`

## Scripts

- `npm run test` - todos los tests.
- `npm run test:headed` - tests con navegador visible.
- `npm run test:visual` - solo visual tests.
- `npm run test:chrome` - solo Chromium.
- `npm run test:debug` - modo debug.
- `npm run report` - abrir reporte Playwright.
- `npm run report:allure` - generar reporte HTML de Allure.
- `npm run report:allure:open` - abrir reporte Allure generado.

## Percy

Test visual ejemplo:

- `src/tests/visual/home.visual.spec.ts`

Ejecución:

```bash
npx percy exec -- npm run test:visual
```

## CI/CD

Workflow: `.github/workflows/automation.yml`

Ejecuta en `push`, `pull_request` y `workflow_dispatch`:

1. `npm ci`
2. `playwright install --with-deps`
3. tests E2E
4. tests visuales con Percy (si existe `PERCY_TOKEN`)
5. genera y publica reportes Playwright + Allure

## Allure

El proyecto genera resultados Allure en cada corrida de Playwright (`allure-results`).

Para ver reporte Allure local:

```bash
npm run test:chrome
npm run report:allure
npm run report:allure:open
```
