import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('autentica', async ({ page }) => {
  await page.goto('/login');

  // TODO: ajuste os locators para a UI real do FLUXO
  await page.getByLabel('E-mail').fill(process.env.FLUXO_USER!);
  await page.getByLabel('Senha').fill(process.env.FLUXO_PASS!);
  await page.getByRole('button', { name: /entrar|login/i }).click();

  // Espera um sinal real de sessão, não um timeout
  await expect(page.getByRole('button', { name: /sair|logout/i })).toBeVisible();

  await page.context().storageState({ path: authFile });
});


