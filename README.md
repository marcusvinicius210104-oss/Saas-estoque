# Flash — Controle de Estoque e Vendas

Sistema web para controle de estoque, vendas (à vista e a prazo) e finanças de
pequenos negócios. Acesso restrito ao proprietário (administrador) e aos
vendedores cadastrados por ele — não existe cadastro público.

## Funcionalidades

- **Login restrito**: apenas usuários cadastrados pelo administrador acessam o sistema.
- **Estoque**: cadastro de produtos (custo, preço de venda, estoque mínimo) e
  movimentações de entrada/saída/ajuste, com histórico.
- **Vendas**: tela de venda rápida (tipo PDV) com busca de produtos, carrinho e
  baixa automática de estoque.
- **Vendas a prazo / Contas a receber**: vendas fiadas ficam associadas a um
  cliente, com vencimento e controle de pagamentos parciais.
- **Clientes**: cadastro com saldo em aberto por cliente.
- **Painel financeiro**: vendas do dia/mês, lucro estimado, valor em estoque,
  total a receber e valores em atraso, com gráficos.
- **Usuários**: o administrador cria, edita, ativa/desativa e redefine senhas
  dos vendedores.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Prisma (PostgreSQL) +
autenticação própria via sessão assinada (JWT em cookie httpOnly).

## Como rodar localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um banco Postgres gratuito (ex.: [Supabase](https://supabase.com),
   [Neon](https://neon.tech) ou Vercel Postgres) e copie a connection string.

3. Configure o `.env`:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL`: a connection string do Postgres.
   - `SESSION_SECRET`: gere uma chave aleatória com
     `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME`: credenciais do primeiro
     usuário administrador (troque a senha depois do primeiro acesso).

4. Crie as tabelas no banco:

   ```bash
   npm run db:migrate
   ```

5. Crie o usuário administrador inicial:

   ```bash
   npm run db:seed
   ```

6. Suba o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

7. Acesse [http://localhost:3000](http://localhost:3000) e entre com as
   credenciais do administrador. Cadastre os vendedores em **Vendedores**.

## Deploy na Vercel

O comando `npm run build` já roda `prisma migrate deploy` e `prisma db seed`
antes do build do Next.js, então basta configurar as variáveis de ambiente
(`DATABASE_URL`, `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`,
`ADMIN_NAME`) no projeto da Vercel e publicar — migrações e o usuário
administrador são criados automaticamente a cada deploy (a criação do
administrador é idempotente, não duplica).

## Scripts úteis

- `npm run dev` — servidor de desenvolvimento.
- `npm run build` / `npm run start` — build e execução em produção.
- `npm run db:migrate` — aplica migrações do Prisma.
- `npm run db:seed` — cria o usuário administrador inicial (idempotente).
- `npm run db:studio` — abre o Prisma Studio para inspecionar o banco.
