import { test, expect } from "@playwright/test";

/**
 * Smoke test real contra el sitio en vivo de Zerimar Software
 * (https://zerimarsoftware.com/). A diferencia del resto de la suite, este
 * spec ignora el baseURL del config (automationexercise.com) y navega
 * directo a la URL real del cliente, para poblar evidencias autenticas
 * (screenshots, video, trace, reporte) en el dashboard demo de Zerimar.
 *
 * Se excluye de las corridas normales (npm run test / test:ci) via el tag
 * @zerimar; se ejecuta explicitamente con:
 *   npx playwright test -c config/playwright.config.ts --grep @zerimar
 */
const ZERIMAR_URL = "https://zerimarsoftware.com/";

test.describe("Zerimar Software - Sitio Web @zerimar @smoke", () => {
  test("carga el home y muestra el hero principal", async ({ page }) => {
    const response = await page.goto(ZERIMAR_URL);
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveTitle(/Zerimar/i);
    await expect(page.getByRole("heading", { name: /software de la más alta calidad/i })).toBeVisible();
    await page.screenshot({ path: "test-results/zerimar-01-hero.png", fullPage: false });
  });

  test("muestra el catalogo de productos (Dr. Tuxedo y Lluvia de Letras)", async ({ page }) => {
    await page.goto(ZERIMAR_URL);
    await expect(page.getByText(/dr\.?\s*tuxedo/i).first()).toBeVisible();
    await expect(page.getByText(/lluvia de letras/i).first()).toBeVisible();
    await page.screenshot({ path: "test-results/zerimar-02-productos.png", fullPage: false });
  });

  test("muestra el stack tecnologico del equipo", async ({ page }) => {
    await page.goto(ZERIMAR_URL);
    await page.getByText(/tecnologías que dominamos/i).scrollIntoViewIfNeeded();
    await expect(page.getByText(/tecnologías que dominamos/i)).toBeVisible();
    await expect(page.getByText(/flutter/i).first()).toBeVisible();
    await expect(page.getByText(/firebase/i).first()).toBeVisible();
    await page.screenshot({ path: "test-results/zerimar-03-stack.png", fullPage: false });
  });

  test("muestra el proceso de trabajo y el contacto final", async ({ page }) => {
    await page.goto(ZERIMAR_URL);
    const contacto = page.getByText(/contacto@zerimarsoftware\.com/i).first();
    await contacto.scrollIntoViewIfNeeded();
    await expect(contacto).toBeVisible();
    await page.screenshot({ path: "test-results/zerimar-04-contacto.png", fullPage: true });
  });
});
