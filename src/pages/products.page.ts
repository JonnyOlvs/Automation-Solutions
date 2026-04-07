import { expect, type Page } from "@playwright/test";

export class ProductsPage {
  private readonly fields = {
    productsTitle: "h2.title:has-text('All Products')",
    productsList: ".features_items .product-image-wrapper",
    searchInput: "input#search_product",
    searchButton: "button#submit_search",
    searchedProductsTitle: "h2.title:has-text('Searched Products')"
  };

  constructor(private readonly page: Page) {}

  public async goto(): Promise<void> {
    await this.page.goto("/products");
  }

  public async expectProductsVisible(): Promise<void> {
    await expect(this.page).toHaveURL(/\/products/);
    await expect(this.page.locator(this.fields.productsTitle)).toBeVisible();
    await expect(this.page.locator(this.fields.productsList).first()).toBeVisible();
  }

  public async searchProduct(value: string): Promise<void> {
    await this.page.locator(this.fields.searchInput).fill(value);
    await this.page.locator(this.fields.searchButton).click();
  }

  public async expectSearchResultsVisible(): Promise<void> {
    await expect(this.page.locator(this.fields.searchedProductsTitle)).toBeVisible();
    await expect(this.page.locator(this.fields.productsList).first()).toBeVisible();
  }
}
