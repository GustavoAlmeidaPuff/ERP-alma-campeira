import { expect, test, type Page } from '@playwright/test'

type RotaPerf = {
  href: string
  titulo: string
  marcadorShell: string
  marcadorDados: string
}

const ROTAS_ERP: RotaPerf[] = [
  { href: '/materias-primas', titulo: 'Matérias-Primas', marcadorShell: 'h1[data-nav-page-title="Matérias-Primas"]', marcadorDados: 'table' },
  { href: '/facas', titulo: 'Facas', marcadorShell: 'h1[data-nav-page-title="Facas"]', marcadorDados: 'table' },
  { href: '/fornecedores', titulo: 'Fornecedores', marcadorShell: 'h1[data-nav-page-title="Fornecedores"]', marcadorDados: 'table' },
  { href: '/ordens-compra', titulo: 'Ordens de Compra', marcadorShell: 'h1[data-nav-page-title="Ordens de Compra"]', marcadorDados: 'button:has-text("Fila de Reposição")' },
  { href: '/vendas', titulo: 'Vendas', marcadorShell: 'h1[data-nav-page-title="Vendas"]', marcadorDados: 'table' },
  { href: '/clientes', titulo: 'Clientes', marcadorShell: 'h1[data-nav-page-title="Clientes"]', marcadorDados: 'table' },
  { href: '/usuarios', titulo: 'Usuários', marcadorShell: 'h1[data-nav-page-title="Usuários"]', marcadorDados: 'table' },
  { href: '/cargos', titulo: 'Cargos', marcadorShell: 'h1[data-nav-page-title="Cargos"]', marcadorDados: 'h3' },
  { href: '/configuracoes', titulo: 'Configurações', marcadorShell: 'h1[data-nav-page-title="Configurações"]', marcadorDados: 'h2:has-text("Aparência")' },
]

const LIMITE_SHELL_MS = Number(process.env.PERF_SHELL_MAX_MS ?? 100)
const LIMITE_DADOS_MS = Number(process.env.PERF_DADOS_MAX_MS ?? 1200)

async function efetuarLoginSeNecessario(page: Page) {
  const email = process.env.E2E_LOGIN_EMAIL
  const senha = process.env.E2E_LOGIN_SENHA
  const precisaLogin = !!email && !!senha

  await page.goto('/login')

  const formVisivel = await page.locator('form').isVisible().catch(() => false)
  if (!formVisivel) {
    return
  }

  test.skip(!precisaLogin, 'Defina E2E_LOGIN_EMAIL e E2E_LOGIN_SENHA para testar rotas autenticadas.')

  await page.getByLabel('E-mail').fill(email!)
  await page.getByLabel('Senha').fill(senha!)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL(/\/(materias-primas|login|$)/, { timeout: 15_000 })

  if (page.url().includes('/login')) {
    throw new Error('Login não foi concluído. Verifique E2E_LOGIN_EMAIL e E2E_LOGIN_SENHA.')
  }
}

test.describe('Performance de entrega de conteúdo por clique', () => {
  test('mede todas as páginas do ERP', async ({ page }) => {
    await efetuarLoginSeNecessario(page)

    const resultados: Array<{ rota: string; shellMs: number; dadosMs: number }> = []
    await page.goto('/materias-primas')
    await expect(page.locator('h1[data-nav-page-title="Matérias-Primas"]')).toBeVisible()

    for (const rota of ROTAS_ERP) {
      const link = page.locator(`a[href="${rota.href}"]`).first()
      await expect(link).toBeVisible()

      const inicio = performance.now()
      await link.click()
      await expect(page).toHaveURL(new RegExp(`${rota.href}$`), { timeout: 15_000 })
      await expect(page.locator(rota.marcadorShell)).toBeVisible({ timeout: 15_000 })
      const shellMs = Math.round(performance.now() - inicio)
      await expect(page.locator(rota.marcadorDados).first()).toBeVisible({ timeout: 15_000 })
      const dadosMs = Math.round(performance.now() - inicio)

      resultados.push({ rota: rota.titulo, shellMs, dadosMs })
      expect(
        shellMs,
        `Rota "${rota.titulo}" demorou ${shellMs}ms para shell (limite: ${LIMITE_SHELL_MS}ms).`
      ).toBeLessThanOrEqual(LIMITE_SHELL_MS)
      expect(
        dadosMs,
        `Rota "${rota.titulo}" demorou ${dadosMs}ms para dados críticos (limite: ${LIMITE_DADOS_MS}ms).`
      ).toBeLessThanOrEqual(LIMITE_DADOS_MS)
    }

    const relatorio = resultados
      .map((r) => `${r.rota}: shell ${r.shellMs}ms | dados ${r.dadosMs}ms`)
      .join('\n')
    console.log(`\n[PERF] Tempo por clique até conteúdo visível e dados:\n${relatorio}\n`)
  })
})
