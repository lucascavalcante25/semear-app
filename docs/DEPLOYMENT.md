# Guia de Implantação – Semear App (Produção/Testes)

Este guia descreve como colocar o Semear em um ambiente **gratuito** para os irmãos testarem, sem domínio próprio. Backend e frontend ficam em serviços separados.

## Visão geral

| Componente | Onde hospedar | Custo |
|------------|---------------|-------|
| **Frontend** (React) | Vercel | Grátis |
| **Backend** (Spring Boot) | Render | Grátis* |
| **PostgreSQL** | Neon ou Supabase | Grátis |

\* Render: serviço “dorme” após 15 min sem uso; o primeiro acesso pode levar ~1 min para acordar.

---

## Pré-requisitos

- Conta no [GitHub](https://github.com)
- Conta na [Vercel](https://vercel.com)
- Conta no [Render](https://render.com)
- Conta na [Neon](https://neon.tech) ou [Supabase](https://supabase.com)

---

## 1. Banco de dados (PostgreSQL)

### Opção A: Neon (recomendado)

1. Acesse [neon.tech](https://neon.tech) e crie uma conta.
2. Crie um projeto (ex.: `semear`).
3. Anote:
   - **Connection string** (ex.: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`)
   - **Host**, **Database**, **User**, **Password** (se preferir montar a URL manualmente).

### Opção B: Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto.
2. Em **Settings → Database** copie a **Connection string** (modo URI).
3. Use a string no formato:  
   `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

---

## 2. Usuário administrador (criado automaticamente)

Na **primeira execução** do backend, o Liquibase cria as tabelas e insere o usuário administrador. Você já terá acesso total para aprovar pré-cadastros.

| Campo | Valor |
|-------|-------|
| **Login** | `11111111111` |
| **Senha** | `admin@SemearApp` |

**Importante:**  
- Troque a senha logo após o primeiro acesso em **Configurações**.  
- O admin é criado automaticamente quando o banco está vazio e o Liquibase roda (primeiro deploy).

---

## 3. Backend no Render

1. Faça push do projeto para o GitHub (se ainda não fez).
2. Acesse [render.com](https://render.com) → **New** → **Web Service**.
3. Conecte o repositório do Semear.
4. Configure:
   - **Name**: `semear-api`
   - **Region**: South America (São Paulo) ou o mais próximo.
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Docker` ou `Native` (veja abaixo).
   - **Build Command** (Native):
     ```bash
     ./mvnw -B -Pprod clean package -DskipTests
     ```
   - **Start Command** (Native):
     ```bash
     java -jar target/semear-*.jar --spring.profiles.active=prod
     ```

5. Em **Environment**, adicione:

   | Variável | Valor |
   |----------|-------|
   | `SPRING_PROFILES_ACTIVE` | `prod` |
   | `SEMEAR_DB_URL` | `jdbc:postgresql://HOST:5432/DATABASE?sslmode=require` |
   | `SEMEAR_DB_USER` | usuário do banco |
   | `SEMEAR_DB_PASSWORD` | senha do banco |
   | `SEMEAR_CORS_ORIGINS` | `https://semear-app.vercel.app` (ajuste após o deploy do frontend) |

6. **Opcional – segurança**: gere um novo segredo JWT e defina a variável `JHIPSTER_SECURITY_AUTHENTICATION_JWT_BASE64_SECRET`:
   ```bash
   openssl rand -base64 64
   ```

7. Salve e aguarde o deploy.
8. Anote a URL do serviço (ex.: `https://semear-api.onrender.com`).
9. Na primeira subida, o Liquibase cria as tabelas e o usuário admin.

---

## 4. Frontend na Vercel

1. Acesse [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Importe o repositório do Semear.
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (raiz do projeto)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Em **Environment Variables**, adicione:

   | Variável | Valor |
   |----------|-------|
   | `VITE_API_URL` | `https://semear-api.onrender.com` (URL do backend no Render) |

5. Faça o deploy.
6. Anote a URL do frontend (ex.: `https://semear-app-xxx.vercel.app`).

---

## 5. Ajustar CORS no backend

1. No Render, vá em **Environment** do serviço do backend.
2. Atualize `SEMEAR_CORS_ORIGINS` com a URL exata do frontend na Vercel:
   ```
   https://semear-app-xxx.vercel.app
   ```
3. Se tiver mais de uma URL (ex.: preview), use vírgula:
   ```
   https://semear-app.vercel.app,https://semear-app-xxx.vercel.app
   ```
4. Salve e aguarde o redeploy.

---

## 6. Primeiro acesso

1. Acesse a URL do frontend na Vercel.
2. Faça login com o usuário admin (Login: 11111111111, Senha: admin@SemearApp).
3. Troque a senha em Configurações e acesse Aprovar pré-cadastros. Se o backend estiver “dormindo”, o primeiro acesso pode demorar ~1 minuto.

---

## Estrutura do projeto

O repositório tem backend e frontend na mesma raiz:

```
semear-app/
├── backend/          # Spring Boot (JHipster)
│   ├── pom.xml
│   └── src/...
├── src/              # Frontend React (Vite)
│   ├── main.tsx
│   └── ...
├── public/
└── package.json
```

- **Render**: usa `backend` como raiz.
- **Vercel**: usa a raiz do projeto e o `package.json` do frontend.

---

## JHipster e deploy

O JHipster ajuda com:

- Configuração de perfis (`prod`, `dev`)
- Liquibase para migrações
- JWT e segurança
- Variáveis de ambiente (`SEMEAR_DB_*`)

O que você precisa fazer manualmente:

- Escolher onde hospedar (Render, Vercel, etc.)
- Configurar CORS para a URL do frontend
- Definir `VITE_API_URL` no build do frontend

---

## Limitações do plano gratuito

| Serviço | Limitação |
|---------|-----------|
| **Render** | Serviço dorme após 15 min; primeiro acesso pode levar ~1 min |
| **Vercel** | Uso pessoal/hobby; limites de banda e funções |
| **Neon** | 0,5 GB; compute pode suspender após inatividade |
| **Supabase** | 500 MB; limites de requisições |

Para uso contínuo em produção, considere planos pagos (ex.: Render Starter, Neon/Supabase Pro).

---

## Domínio próprio (futuro)

Quando tiver domínio (ex.: `app.igrejasemear.com.br`):

1. **Vercel**: adicione o domínio em **Settings → Domains**.
2. **Render**: adicione domínio customizado no serviço.
3. Atualize `SEMEAR_CORS_ORIGINS` com a nova URL do frontend.
4. Atualize `VITE_API_URL` com a nova URL do backend.

---

## Resumo rápido

1. Criar banco no Neon ou Supabase.
2. Deploy do backend no Render com variáveis de ambiente.
3. Deploy do frontend na Vercel com `VITE_API_URL`.
4. Ajustar `SEMEAR_CORS_ORIGINS` no Render com a URL do frontend.
5. Acessar o app com o admin (`11111111111` / `admin@SemearApp`) e trocar a senha.
6. Aprovar pré-cadastros em **Aprovar pré-cadastros**.
