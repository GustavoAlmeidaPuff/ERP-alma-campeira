# Alma Campeira

ERP sob medida para uma cutelaria artesanal: do controle de materias-primas ate a geracao automatica de ordens de compra por fornecedor.

## Stack inicial

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (Auth e Database)

## Como rodar localmente

1. Copie as variaveis de ambiente:
   - `cp .env.example .env.local`
2. Preencha no `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY` (uso apenas no servidor)
3. Instale as dependencias:
   - `npm install`
4. Rode o projeto:
   - `npm run dev`

Abra [http://localhost:3000](http://localhost:3000).

## Estrutura criada

- `src/app`: base do App Router
- `src/lib/supabase/client.ts`: cliente Supabase para browser
- `src/lib/supabase/server.ts`: cliente Supabase para Server Components/Actions
- `src/lib/supabase/middleware.ts`: atualizacao de sessao no middleware
- `middleware.ts`: integracao do middleware no Next.js