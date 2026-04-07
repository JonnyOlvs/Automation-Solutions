import { test, expect } from "@playwright/test";
import { HomePage } from "../../pages/home.page";

test.describe("Home - E2E @smoke @home", () => {
  test("debe cargar homepage, mostrar logo/menu y navegar correctamente", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.expectHomeLoaded();
    await homePage.expectMenuVisible();

    await homePage.goToProducts();
    await expect(page).toHaveURL(/\/products/);

    await homePage.goToHomeFromMenu();
    await expect(page).toHaveURL(/automationexercise\.com\/?$/);
  });
});
