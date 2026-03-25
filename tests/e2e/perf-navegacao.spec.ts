import { expect, test, type Page } from '@playwright/test'

type RotaPerf = {
  href: string
  titulo: string
  marcador: string
}

const ROTAS_ERP: RotaPerf[] = [
  { href: '/materias-primas', titulo: 'Matérias-Primas', marcador: 'h1:has-text("Matérias-Primas")' },
  { href: '/facas', titulo: 'Facas', marcador: 'h1:has-text("Facas")' },
  { href: '/fornecedores', titulo: 'Fornecedores', marcador: 'h1:has-text("Fornecedores")' },
  { href: '/ordens-compra', titulo: 'Ordens de Compra', marcador: 'h1:has-text("Ordens de Compra")' },
  { href: '/vendas', titulo: 'Vendas', marcador: 'h1:has-text("Vendas")' },
  { href: '/clientes', titulo: 'Clientes', marcador: 'h1:has-text("Clientes")' },
  { href: '/usuarios', titulo: 'Usuários', marcador: 'h1:has-text("Usuários")' },
  { href: '/cargos', titulo: 'Cargos', marcador: 'h1:has-text("Cargos")' },
  { href: '/configuracoes', titulo: 'Configurações', marcador: 'h1:has-text("Configurações")' },
]

const LIMITE_MS = Number(process.env.PERF_MAX_MS ?? 4000)

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

    const resultados: Array<{ rota: string; ms: number }> = []
    await page.goto('/materias-primas')
    await expect(page.locator('h1:has-text("Matérias-Primas")')).toBeVisible()

    for (const rota of ROTAS_ERP) {
      const link = page.locator(`a[href="${rota.href}"]`).first()
      await expect(link).toBeVisible()

      const inicio = performance.now()
      await link.click()
      await expect(page).toHaveURL(new RegExp(`${rota.href}$`), { timeout: 15_000 })
      await expect(page.locator(rota.marcador)).toBeVisible({ timeout: 15_000 })
      const fim = performance.now()

      const duracao = Math.round(fim - inicio)
      resultados.push({ rota: rota.titulo, ms: duracao })
      expect(
        duracao,
        `Rota "${rota.titulo}" demorou ${duracao}ms (limite: ${LIMITE_MS}ms).`
      ).toBeLessThanOrEqual(LIMITE_MS)
    }

    const relatorio = resultados.map((r) => `${r.rota}: ${r.ms}ms`).join('\n')
    console.log(`\n[PERF] Tempo por clique até conteúdo visível:\n${relatorio}\n`)
  })
})
