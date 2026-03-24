import { AlmaLogo } from "@/components/alma-logo";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { redirect } from "next/navigation";

export default async function Home() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-[var(--ac-bg)] p-6 md:p-10">
        <h1 className="text-2xl font-bold text-[var(--ac-text)] md:text-4xl">
          ERP Alma Campeira
        </h1>
        <p className="max-w-3xl text-sm text-[var(--ac-muted)] md:text-base">
          Projeto Next.js criado com sucesso. Para conectar o Supabase, copie
          o arquivo `.env.example` para `.env.local` e preencha as variaveis.
        </p>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[var(--ac-bg)]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 md:p-10">
        <header className="flex flex-col gap-4 border-b border-[var(--ac-border)] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <AlmaLogo />
          <p className="text-sm text-[var(--ac-muted)]">
            Sessão: <span className="font-medium text-[var(--ac-text)]">{user.email}</span>
          </p>
        </header>
        <div>
          <h1 className="text-2xl font-bold text-[var(--ac-text)] md:text-3xl">
            Início
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--ac-muted)] md:text-base">
            Ambiente inicial do ERP. Os módulos de estoque, pedidos e compras
            podem ser adicionados aqui.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--ac-border)] bg-[var(--ac-card)] p-4 shadow-sm">
          <p className="text-sm text-[var(--ac-text)]">
            Você está autenticado. Use o menu quando as rotas estiverem
            disponíveis.
          </p>
        </div>
      </div>
    </main>
  );
}
