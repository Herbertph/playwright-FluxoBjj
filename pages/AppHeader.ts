import { Page, Locator } from '@playwright/test';

export class AppHeader {
  readonly page: Page;
  readonly logoutButton: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logoutButton = page.getByRole('button', { name: /sair|logout/i });
    this.loginLink = page.getByRole('link', { name: 'Entrar', exact: true });
  }

  async logout() {
    await this.logoutButton.click();
  }
}
