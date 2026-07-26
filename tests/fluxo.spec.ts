import { test, expect } from '@playwright/test';

test('a home do FLUXO carrega', async ({ page }) => {
  await page.goto('https://fluxo-production-052e.up.railway.app/');

  // ajusta o texto esperado pro que realmente aparece no título da aba
  await expect(page).toHaveTitle(/FLUXO/i);
});

test('elementos principais da home estao visiveis', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Começar agora' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver planos' })).toBeVisible();
  await expect(page.getByText('O JOGO INTEIRO')).toBeVisible();
});

test('clicar em Ver planos leva pra pagina de planos', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Ver planos' }).click();
  // ajusta a URL/texto esperado pro que realmente acontece — descobre rodando
  await expect(page).toHaveURL(/pricing/);
});

test('trocar idioma para EN muda o texto', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'EN' }).click();
  // depois de clicar EN, o hero deixa de estar em PT — verifica o texto novo
  await expect(page.getByText('O JOGO INTEIRO')).not.toBeVisible();
});

