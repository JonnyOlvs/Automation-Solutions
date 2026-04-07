import { test } from "@playwright/test";
import percySnapshot from "@percy/playwright";
import { HomePage } from "../../pages/home.page";

test.describe("Home - Visual @visual", () => {
  test("debe tomar snapshot visual del homepage", async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    await page.waitForLoadState("networkidle");

    await percySnapshot(page, "Home Page - Visual Baseline");
  });
});
