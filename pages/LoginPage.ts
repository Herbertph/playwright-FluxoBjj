import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('E-mail');
    this.passwordInput = page.getByLabel('Senha');
    this.submitButton = page.getByRole('button', { name: /entrar|login/i });
    // Not getByRole('alert'): the only alert on the page is Next.js's empty
    // route announcer, which made FLX-AUTH-02 pass with no error shown.
    this.errorMessage = page.getByText('E-mail ou senha inválidos.');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}