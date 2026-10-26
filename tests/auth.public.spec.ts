import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { AppHeader } from '../pages/AppHeader';

test.describe('Autenticação', () => {
  test('FLX-AUTH-02: senha inválida exibe erro e não cria sessão', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.FLUXO_USER!, 'senha-errada-123');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(page).toHaveURL(/login/);
  });

  test('FLX-AUTH-03: rota protegida redireciona sem sessão', async ({ page }) => {
    await page.goto('/app'); 
    await expect(page).toHaveURL(/login/);
  });
});

// Logout logs in fresh instead of reusing the shared storageState: ending
// that session could invalidate it for every *.auth.spec.ts test.
test.describe('Logout', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.FLUXO_USER!, process.env.FLUXO_PASS!);
    await expect(new AppHeader(page).logoutButton).toBeVisible();
  });

  test('FLX-AUTH-04 · TC-1 (AC-1): logout returns to the unauthenticated state', async ({ page }) => {
    const header = new AppHeader(page);
    await header.logout();

    await expect(header.loginLink).toBeVisible();
    await expect(header.logoutButton).toBeHidden();
  });

  test('FLX-AUTH-04 · TC-2 (AC-1): protected route redirects to login after logout', async ({ page }) => {
    const header = new AppHeader(page);
    await header.logout();
    await expect(header.loginLink).toBeVisible();

    await page.goto('/app');

    await expect(page).toHaveURL(/\/login/);
    await expect(header.logoutButton).toBeHidden();
  });
});
