# Membros no localhost

## Onde ficam os membros?

O endpoint `/api/membros` usa a tabela **`jhi_user`** (não existe tabela `membro`).  
Os membros são usuários cadastrados com seus respectivos papéis em `jhi_user_authority`.

## Por que localhost mostra 0 membros?

O backend local provavelmente está conectado a um banco diferente do de produção:

- **Produção (Vercel + Render)**: usa Supabase → 20 membros
- **Localhost**: usa PostgreSQL local ou outro Supabase → banco vazio ou com poucos dados

## Como resolver

Para ver os mesmos membros no localhost, configure o backend para usar o **mesmo banco de produção**:

1. No `backend/src/main/resources/config/application-dev.yml` ou via variáveis de ambiente:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://SEU_HOST_SUPABASE:5432/postgres
       username: postgres
       password: SUA_SENHA
   ```

2. Ou use variáveis de ambiente ao rodar o backend:
   ```powershell
   $env:SEMEAR_DB_URL="jdbc:postgresql://db.xxxxx.supabase.co:5432/postgres"
   $env:SEMEAR_DB_USER="postgres"
   $env:SEMEAR_DB_PASSWORD="sua_senha"
   ```

3. O frontend local deve apontar para o backend que usa esse banco (ou para o backend de produção):
   ```
   VITE_API_URL=http://localhost:8080
   ```
   ou
   ```
   VITE_API_URL=https://semear-api-pl65.onrender.com
   ```

## Tabela `membro` no DBeaver

Se aparecer uma tabela `membro` no seu banco, ela pode ser de outro projeto ou de uma migração antiga. O app Semear usa apenas `jhi_user` para membros.
