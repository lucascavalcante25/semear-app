# Semear App

Aplicação da Comunidade Evangélica Semear – gestão de membros, visitantes, avisos, louvores, devocionais, financeiro e mais.

## Tecnologias

- **Frontend:** Vite, TypeScript, React, shadcn/ui, Tailwind CSS
- **Backend:** Spring Boot (JHipster), Java 17, PostgreSQL

## Desenvolvimento local

### Pré-requisitos

- Node.js e npm
- Java 17
- PostgreSQL

### Frontend

```sh
# Clone o repositório
git clone <YOUR_GIT_URL>
cd semear-app

# Instale as dependências
npm i

# Inicie o servidor de desenvolvimento
npm run dev
```

### Configuração local (API e banco)

Para usar o backend local, configure o endereço da API no frontend. Crie um arquivo `.env.local` na raiz do projeto:

```sh
VITE_API_URL=http://localhost:8080
```

Para acessar de outro PC na rede, use o IP da máquina que roda o backend:

```sh
VITE_API_URL=http://192.168.0.10:8080
```

No backend, as credenciais do banco podem ser alteradas por variáveis de ambiente:

```powershell
$env:SEMEAR_DB_URL="jdbc:postgresql://localhost:5432/semearDB"
$env:SEMEAR_DB_USER="postgres"
$env:SEMEAR_DB_PASSWORD="postgres"
```

### Backend

```sh
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

## Deploy em produção

Consulte o guia em [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) para implantar em ambiente externo (Render, Vercel, Neon/Supabase).

## Estrutura do projeto

```
semear-app/
├── backend/       # Spring Boot (JHipster)
├── src/           # Frontend React (Vite)
├── public/
└── docs/
```
