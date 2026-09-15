import { test } from "@playwright/test";
import { HomePage } from "../../pages/home.page";
import { LoginPage } from "../../pages/login.page";

test.describe("Login - E2E @smoke @login", () => {
  test("debe navegar a login y mostrar campos/boton", async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);

    await homePage.goto();
    await page.screenshot({
      path: `test-results/screenshots/login-01-home.png`,
      fullPage: true
    });

    await homePage.goToLogin();
    await page.screenshot({
      path: `test-results/screenshots/login-02-login-page.png`,
      fullPage: true
    });

    await loginPage.expectLoginFormVisible();
    await page.screenshot({
      path: `test-results/screenshots/login-03-login-visible.png`,
      fullPage: true
    });
  });
});
