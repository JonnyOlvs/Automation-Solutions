import { test } from "@playwright/test";
import { ProductsPage } from "../../pages/products.page";

test.describe("Products - E2E @regression @products", () => {
  test("debe mostrar lista de productos y permitir busqueda", async ({ page }) => {
    const productsPage = new ProductsPage(page);

    await productsPage.goto();
    await productsPage.expectProductsVisible();

    await productsPage.searchProduct("Top");
    await productsPage.expectSearchResultsVisible();
  });
});
