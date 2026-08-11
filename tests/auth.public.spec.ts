import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Autenticação', () => {
  test('FLX-AUTH-02: senha inválida exibe erro e não cria sessão', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.FLUXO_USER!, 'senha-errada-123');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(page).toHaveURL(/login/);
  });

  test('FLX-AUTH-03: rota protegida redireciona sem sessão', async ({ page }) => {
    await page.goto('/dashboard'); // ajuste para uma rota real
    await expect(page).toHaveURL(/login/);
  });
});