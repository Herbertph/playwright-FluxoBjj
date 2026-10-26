import { test, expect } from '@playwright/test';

test('FLX-HOME-01 · TC-3 (AC-2): home page loads from the configured base URL', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/FLUXO/i);
});

test('FLX-HOME-02 · TC-4 (AC-3): main calls to action are visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'O jogo inteiro, num só mapa.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Começar agora' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver planos' })).toBeVisible();
});

test('FLX-HOME-03 · TC-5 (AC-3): "Ver planos" leads to the pricing page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Ver planos' }).click();
  await expect(page).toHaveURL(/pricing/);
});

test.describe('FLX-I18N-01: language switch', () => {
  test('FLX-I18N-01 · TC-6 (AC-4): switching to EN shows English copy', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'EN' }).click();

    await expect(page.getByRole('heading', { name: 'Every path of the game, in one map.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'O jogo inteiro, num só mapa.' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('FLX-I18N-01 · TC-7 (AC-4): language choice survives navigation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'EN' }).click();
    await page.getByRole('link', { name: 'Pricing', exact: true }).click();

    await expect(page).toHaveURL(/pricing/);
    await expect(page.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true');

    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Log in', level: 1 })).toBeVisible();
  });
});
