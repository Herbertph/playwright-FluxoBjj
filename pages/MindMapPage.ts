import { Page, Locator } from '@playwright/test';

export class MindMapPage {
  readonly page: Page;
  readonly abrirSalvarSequencia: Locator;
  readonly confirmarSalvar: Locator;
  readonly treineiHoje: Locator;

  constructor(page: Page) {
    this.page = page;
    this.abrirSalvarSequencia = page.getByRole('button', { name: /Salvar sequência/ }).first();
    this.confirmarSalvar = page.getByRole('button', { name: 'Salvar sequência', exact: true });
    this.treineiHoje = page.getByRole('button', { name: /Treinei hoje/ });
  }

  posicao(nome: string): Locator {
    return this.page.getByRole('button', { name: new RegExp(nome, 'i') });
  }

  async montarSequencia(nomes: string[]) {
    for (const nome of nomes) {
      await this.posicao(nome).first().click();
    }
  }

  async salvarSequencia() {
    await this.abrirSalvarSequencia.click();
    await this.confirmarSalvar.click();
  }
}