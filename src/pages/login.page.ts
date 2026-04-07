import { expect, type Page } from "@playwright/test";

export class LoginPage {
  private readonly fields = {
    loginFormTitle: "h2:has-text('Login to your account')",
    emailInput: "input[data-qa='login-email']",
    passwordInput: "input[data-qa='login-password']",
    loginButton: "button[data-qa='login-button']"
  };

  constructor(private readonly page: Page) {}

  public async goto(): Promise<void> {
    await this.page.goto("/login");
  }

  public async expectLoginFormVisible(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login/);
    await expect(this.page.locator(this.fields.loginFormTitle)).toBeVisible();
    await expect(this.page.locator(this.fields.emailInput)).toBeVisible();
    await expect(this.page.locator(this.fields.passwordInput)).toBeVisible();
    await expect(this.page.locator(this.fields.loginButton)).toBeVisible();
  }
}
