import { test, expect } from '@playwright/test';
import { MindMapPage } from '../pages/MindMapPage';

test.describe('Sequências', () => {
  test.skip('FLX-SEQ-01: mount a sequence', async ({ page }) => {
    // Skipped: position nodes are not reachable from the route the suite navigates to.
  // Requires stable test attributes on map nodes — see docs/test-plan.md §7.
    const mapa = new MindMapPage(page);
    await page.goto('/');

    await mapa.montarSequencia(['Raspagem', 'Transição', 'Finalização']);
    await mapa.salvarSequencia();

    await expect(page.getByText(/sequência salva|salva com sucesso/i)).toBeVisible();
  });

  test.skip('FLX-SEQ-02: sequence persists after reload', async ({ page }) => {
    // Skipped: position nodes are not reachable from the route the suite navigates to.
  // Requires stable test attributes on map nodes — see docs/test-plan.md §7.
    const mapa = new MindMapPage(page);
    await page.goto('/');

    await mapa.montarSequencia(['Raspagem', 'Transição']);
    await mapa.salvarSequencia();

    await page.reload();

    // TODO: aponte para onde a sequência salva aparece
    await expect(page.getByText('Raspagem')).toBeVisible();
  });
});