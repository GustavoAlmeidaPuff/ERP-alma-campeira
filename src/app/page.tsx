import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default async function Home() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6 md:p-10">
        <h1 className="text-2xl font-bold md:text-4xl">ERP Alma Campeira</h1>
        <p className="max-w-3xl text-sm md:text-base">
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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6 md:p-10">
      <h1 className="text-2xl font-bold md:text-4xl">ERP Alma Campeira</h1>
      <p className="max-w-3xl text-sm md:text-base">
        Ambiente inicial do Next.js com Supabase configurado. Agora voce pode
        iniciar os modulos de estoque, pedidos e compras.
      </p>
      <div className="rounded-lg border border-zinc-300 p-4 dark:border-zinc-700">
        <p className="text-sm">
          Status da sessao: {user ? `logado como ${user.email}` : "nao logado"}
        </p>
      </div>
    </main>
  );
}
