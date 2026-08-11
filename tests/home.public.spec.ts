import { test, expect } from '@playwright/test';

test('the FLUXO home page loads', async ({ page }) => {
  await page.goto('https://fluxo-production-052e.up.railway.app/');
  await expect(page).toHaveTitle(/FLUXO/i);
});

test('Main elements on the home page are visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Começar agora' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver planos' })).toBeVisible();
  await expect(page.getByText('O JOGO INTEIRO')).toBeVisible();
});

test('clicking on Ver planos leads to the pricing page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Ver planos' }).click();
  await expect(page).toHaveURL(/pricing/);
});

test('switch language to EN changes the text', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'EN' }).click();
  await expect(page.getByText('O JOGO INTEIRO')).not.toBeVisible();
});

