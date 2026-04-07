import { test } from "@playwright/test";
import { HomePage } from "../../pages/home.page";
import { LoginPage } from "../../pages/login.page";

test.describe("Login - E2E @smoke @login", () => {
  test("debe navegar a login y mostrar campos/boton", async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);

    await homePage.goto();
    await homePage.goToLogin();
    await loginPage.expectLoginFormVisible();
  });
});
