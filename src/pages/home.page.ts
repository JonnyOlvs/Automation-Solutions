import { expect, type Page } from "@playwright/test";

export class HomePage {
  private readonly fields = {
    logo: "img[alt='Website for automation practice']",
    topMenuItems: "header .navbar-nav li",
    navHome: "header a[href='/']:has-text('Home')",
    navLogin: "a[href='/login']",
    navProducts: "a[href='/products']"
  };

  constructor(private readonly page: Page) {}

  public async goto(): Promise<void> {
    await this.page.goto("/");
  }

  public async expectHomeLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/automationexercise\.com\/?$/);
    await expect(this.page.locator(this.fields.logo)).toBeVisible();
    await expect(this.page.locator(this.fields.topMenuItems).first()).toBeVisible();
  }

  public async expectMenuVisible(): Promise<void> {
    await expect(this.page.locator(this.fields.topMenuItems).first()).toBeVisible();
  }

  public async goToLogin(): Promise<void> {
    await this.page.locator(this.fields.navLogin).click();
  }

  public async goToProducts(): Promise<void> {
    await this.page.locator(this.fields.navProducts).click();
  }

  public async goToHomeFromMenu(): Promise<void> {
    await this.page.locator(this.fields.navHome).click();
  }
}
