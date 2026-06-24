# Comandos de desenvolvimento — Minha Igreja Digital

Copie e cole no terminal. Abra **dois terminais**: um para o backend e outro para o frontend.

---

## PowerShell (Windows)

### Terminal 1 — Backend

```powershell
cd "C:\Backup Lucas Cesinf\Aplicativos\Workspace Spring\semear-app\backend"
.\run-backend.ps1
```

### Terminal 2 — Frontend

```powershell
cd "C:\Backup Lucas Cesinf\Aplicativos\Workspace Spring\semear-app"
npm run dev
```

---

## CMD (Prompt de Comando)

### Terminal 1 — Backend

```cmd
cd /d "C:\Backup Lucas Cesinf\Aplicativos\Workspace Spring\semear-app\backend"
run-backend.cmd
```

### Terminal 2 — Frontend

```cmd
cd /d "C:\Backup Lucas Cesinf\Aplicativos\Workspace Spring\semear-app"
npm run dev
```

---

## Git Bash

### Terminal 1 — Backend

```bash
cd "/c/Backup Lucas Cesinf/Aplicativos/Workspace Spring/semear-app/backend"
bash run-backend.sh
```

### Terminal 2 — Frontend

```bash
cd "/c/Backup Lucas Cesinf/Aplicativos/Workspace Spring/semear-app"
npm run dev
```

---

## URLs após subir

| Serviço  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:5173        |
| Backend  | http://localhost:8080        |
| API docs | http://localhost:8080/swagger-ui |

---

## Comandos úteis (opcional)

### Compilar backend (sem subir)

**PowerShell:**

```powershell
cd "C:\Backup Lucas Cesinf\Aplicativos\Workspace Spring\semear-app\backend"
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
.\mvnw.cmd compile
```

**Git Bash:**

```bash
cd "/c/Backup Lucas Cesinf/Aplicativos/Workspace Spring/semear-app/backend"
export JAVA_HOME="/c/Program Files/Java/jdk-17"
export PATH="$JAVA_HOME/bin:$PATH"
./mvnw.cmd compile
```

### Testes frontend

```bash
cd "/c/Backup Lucas Cesinf/Aplicativos/Workspace Spring/semear-app"
npm run test
```

### Build de produção (frontend)

```bash
cd "/c/Backup Lucas Cesinf/Aplicativos/Workspace Spring/semear-app"
npm run build
```

---

## Observações

- O backend usa **Java 17** e perfil Spring `dev`.
- Na primeira execução o Maven pode demorar (download de dependências).
- **Não cole** o conteúdo dos scripts `.ps1` no terminal — execute o arquivo com os comandos acima.
- Se o JDK 17 estiver em outro caminho, edite `run-backend.cmd`, `run-backend.ps1` ou `run-backend.sh`.

### Erro `'powershell' não é reconhecido` ao rodar o backend

O `mvnw.cmd` do Maven Wrapper precisa do `powershell.exe` no PATH. Os scripts `run-backend.*` já contornam isso usando o Maven instalado em `%USERPROFILE%\.m2\wrapper\dists\`. Se ainda falhar, use:

```powershell
cd backend
.\run-backend.cmd
```

Ou adicione ao PATH manualmente (PowerShell):

```powershell
$env:Path = "$env:SystemRoot\System32\WindowsPowerShell\v1.0;$env:Path"
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
```

### Erro `Port 8080 was already in use`

Geralmente há outra instância do backend (`java.exe`) ainda rodando. **PowerShell:**

```powershell
# Ver quem usa a porta 8080
netstat -ano | findstr ":8080"
# Na linha LISTENING, anote o PID (última coluna) e encerre:
taskkill /PID <PID> /F
```

Alternativa com um comando:

```powershell
Get-NetTCPConnection -LocalPort 8080 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

Depois rode `.\run-backend.ps1` de novo.

**Outra porta (sem matar o processo):**

```powershell
$env:PORT = "8081"
.\run-backend.ps1
```

Se usar outra porta, ajuste o proxy do Vite em `vite.config.ts` ou a variável de API do frontend.

---

## Dados de teste (perfil `dev`)

**Importante:** os dados mock são gerados por código Java (`DevSeedService`) com `@Profile("dev")`.  
Ao fazer commit, **só o código vai para o repositório** — os registros nas tabelas ficam apenas no seu banco local. **Produção não executa esse seed.**

Na subida do backend em `dev`, o sistema popula automaticamente (de forma incremental — cada igreja/marca só roda uma vez):

- **4 igrejas:** Semear + Renovo de Vida + Monte Sião + Betânia
- Membros com **senha individual** por CPF (equipe principal + portaria, recepção, limpeza)
- **8 visitantes** por igreja (funil completo, formas de chegada variadas) + acompanhamento pastoral
- Visitantes, avisos e informativos **personalizados por igreja**
- Oração, departamentos, **escalas (domingo + quinta + limpeza)**, automação de escalas
- **Financeiro** (~10 lançamentos por igreja, categorias e centros de custo distintos)
- **15 louvores** e **3 grupos de louvor** por igreja
- Eventos, devocionais, documentos, **crianças e dependentes em todas as igrejas**
- Pré-cadastros pendentes, solicitações de acesso (super-admin), tickets de suporte

**Reinicie o backend** após atualizar o código. Se as igrejas já existiam com seed antigo, o sistema **enriquece** automaticamente (novos membros + conteúdo personalizado) na próxima subida.

### Hierarquia de acesso

| Nível | CPF (login) | Senha | Escopo |
|-------|-------------|-------|--------|
| **Super Admin** (você — plataforma) | `11111111111` | `admin@SemearApp` | Todas as igrejas, assinaturas, solicitações |
| **Admin igreja** | `121…` / `211…` / `311…` / `411…` | ver tabelas abaixo | Uma igreja específica |
| **Pastor, secretaria, tesouraria…** | CPFs `222…`, `333…` etc. | individual | Módulos do perfil na igreja |

O CPF `11111111111` é **exclusivo do super admin** — não é usado como admin de igreja no seed.

### Super Admin (plataforma)

| Perfil | CPF (login) | Senha |
|--------|-------------|-------|
| Super Admin | `11111111111` | `admin@SemearApp` |

### Igreja Semear (`/i/semear`)

| Perfil | CPF | Senha |
|--------|-----|-------|
| **Admin igreja** | `12111111111` | `semear121` |
| Pastor | `22222222222` | `semear222` |
| Secretária | `33333333333` | `semear333` |
| Tesouraria | `44444444444` | `semear444` |
| Líder louvor | `55555555555` | `semear555` |
| Membro (H) | `66666666666` | `semear666` |
| Membro (M) | `77777777777` | `semear777` |
| Visitante | `88888888888` | `semear888` |
| Co-pastora | `99999999999` | `semear999` |
| Portaria 1 / 2 | `22222222201` / `22222222202` | `semear201` / `semear202` |
| Recepção 1 / 2 | `33333333301` / `33333333302` | `semear301` / `semear302` |
| Limpeza 1 / 2 | `33333333303` / `33333333304` | `semear303` / `semear304` |
| Membros extras | `66666666661` / `77777777771` | `semear661` / `semear771` |

**Visitantes (módulo):** 8 cadastros por igreja (ex.: Felipe Andrade, Amanda Teixeira…). **Usuário visitante (login):** `88888888888` / `semear888`.

**Dados personalizados:** avisos `[Semear]`, financeiro (dízimos, obras, EBI), escalas domingo/quinta, eventos (Noite de Louvor, Casais, Conferência Jovem).

### Igreja Renovo de Vida (`/i/renovo-vida`)

| Perfil | CPF | Senha |
|--------|-----|-------|
| **Admin igreja** | `21111111111` | `semear211` |
| Pastor | `21111111222` | `semear212` |
| Secretária | `21111111333` | `semear213` |
| Tesouraria | `21111111444` | `semear214` |
| Líder louvor | `21111111555` | `semear215` |
| Membro (H) | `21111111666` | `semear216` |
| Membro (M) | `21111111777` | `semear217` |
| Portaria 1 / 2 | `21111112101` / `21111112102` | `semear221` / `semear222` |
| Recepção 1 / 2 | `21111112301` / `21111112302` | `semear231` / `semear232` |
| Limpeza 1 / 2 | `21111112303` / `21111112304` | `semear233` / `semear234` |
| Membros extras | `21111111661` / `21111111771` | `semear261` / `semear271` |
| Visitante (login) | `21111111888` | `semear218` |

**Visitantes (módulo):** 8 cadastros (Lucas Ceará, Marina Sousa, Tiago Ribeiro…).

**Dados personalizados:** avisos `[Renovo]`, financeiro (cestas básicas, reforma cozinha), escalas, eventos (Vigília, Encontro de Mulheres).

### Igreja Monte Sião (`/i/monte-siao`)

| Perfil | CPF | Senha |
|--------|-----|-------|
| **Admin igreja** | `31111111111` | `semear311` |
| Pastor | `31111111222` | `semear312` |
| Secretária | `31111111333` | `semear313` |
| Tesouraria | `31111111444` | `semear314` |
| Líder louvor | `31111111555` | `semear315` |
| Membro (H) | `31111111666` | `semear316` |
| Membro (M) | `31111111777` | `semear317` |
| Portaria 1 / 2 | `31111112101` / `31111112102` | `semear321` / `semear322` |
| Recepção 1 / 2 | `31111112301` / `31111112302` | `semear331` / `semear332` |
| Limpeza 1 / 2 | `31111112303` / `31111112304` | `semear333` / `semear334` |
| Membros extras | `31111111661` / `31111111771` | `semear361` / `semear371` |
| Visitante (login) | `31111111888` | `semear318` |

**Visitantes (módulo):** 8 cadastros (Anderson Pernambuco, Letícia Oliveira…).

**Dados personalizados:** avisos `[Monte Sião]`, financeiro (projeto social, escola de líderes), escalas, eventos (Conferência Jovem, Café com Pastores).

### Igreja Betânia (`/i/betania`)

| Perfil | CPF | Senha |
|--------|-----|-------|
| **Admin igreja** | `41111111111` | `semear411` |
| Pastor | `41111111222` | `semear412` |
| Secretária | `41111111333` | `semear413` |
| Tesouraria | `41111111444` | `semear414` |
| Líder louvor | `41111111555` | `semear415` |
| Membro (H) | `41111111666` | `semear416` |
| Membro (M) | `41111111777` | `semear417` |
| Portaria 1 / 2 | `41111112101` / `41111112102` | `semear421` / `semear422` |
| Recepção 1 / 2 | `41111112301` / `41111112302` | `semear431` / `semear432` |
| Limpeza 1 / 2 | `41111112303` / `41111112304` | `semear433` / `semear434` |
| Membros extras | `41111111661` / `41111111771` | `semear461` / `semear471` |
| Visitante (login) | `41111111888` | `semear418` |

**Visitantes (módulo):** 8 cadastros (Jonas Natal, Cristiane Freire…).

**Dados personalizados:** avisos `[Betânia]`, financeiro (batistério, EBD, Bíblias), escalas, eventos (Congresso Batista, Noite de Testemunhos).

### Repetir o seed

- **Enriquecer** (membros extras + conteúdo personalizado): reinicie o backend — detecta avisos sem prefixo `[NomeFantasia]`.
- **Seed completo do zero**: apague usuários/igrejas de teste no banco local (ou use banco limpo) e reinicie.
- Marcadores: Semear = CPF `22222222222`; outras igrejas = slug `renovo-vida`, `monte-siao`, `betania`.
