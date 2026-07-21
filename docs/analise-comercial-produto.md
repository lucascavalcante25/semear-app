# Análise Comercial do Produto — Minha Igreja Digital

> Documento de base para prospecção. Todas as informações abaixo foram extraídas
> diretamente do código, da landing page e dos arquivos de configuração do projeto.
> Onde a informação **não** foi encontrada ou confirmada, está marcado como
> **"Pendente de confirmação"**.

---

## 1. Identificação do produto

| Item | Valor encontrado no projeto |
|------|------------------------------|
| Nome do produto | **Minha Igreja Digital** (`src/lib/plataforma.ts`) |
| Slogan | **"Sua igreja organizada em um só lugar"** |
| Empresa responsável | **WillTech Solutions Dev** |
| Crédito de rodapé | "Desenvolvido por WillTech Solutions Dev" |
| Descrição curta (oficial) | "Plataforma web para igrejas organizarem membros, visitantes, avisos, documentos da igreja, louvores, devocionais e financeiro, com acesso pelo computador e celular." |
| Tipo de sistema | Plataforma web multi-igreja (SaaS), 100% no navegador, sem instalar app |
| Tecnologia | Frontend React/Vite + Backend Spring Boot (Java 17) + PostgreSQL |

### Contatos confirmados (`src/lib/plataforma.ts` + confirmação do proprietário)

- **WhatsApp:** (85) 99958-4674 — link `https://wa.me/5585999584674`
- **Telefone:** (85) 99958-4674 (`+5585999584674`)
- **E-mail:** willtechsolutionsdev@gmail.com
- **Instagram (produto):** [@minhaigrejadigit](https://www.instagram.com/minhaigrejadigit) — confirmado pelo proprietário para promoção do produto

### Links confirmados (rotas em `src/App.tsx`)

- **Landing page:** `/landing` (também acessível por `/precos`)
- **Login:** `/login`
- **Cadastro / teste grátis:** `/solicitar-acesso`
- **Site público da igreja:** `/i/:slug` (cada igreja pode ter sua página)
- **Recuperação de senha:** `/esqueci-senha`
- **Pré-cadastro de membro:** `/pre-cadastro`

---

## 2. O que o sistema realmente faz

O Minha Igreja Digital é uma plataforma de gestão para igrejas onde cada igreja
tem seu próprio ambiente (multi-igreja). Diferentes pessoas acessam com perfis
distintos e o sistema centraliza secretaria, comunicação, escalas, eventos e
finanças em um único lugar, acessível por computador ou celular.

### Perfis de acesso confirmados (`PerfilAcesso.java`)

`ADMIN`, `PASTOR`, `COPASTOR`, `SECRETARIA`, `TESOURARIA`, `LIDER`, `MEMBRO`,
`VISITANTE` — além do perfil de plataforma `SUPER_ADMIN` (administração interna
da WillTech).

Isso confirma que o sistema foi pensado exatamente para o público-alvo da
prospecção: pastor, secretário, tesoureiro, líder e administrador.

---

## 3. Funcionalidades disponíveis (confirmadas no código)

Módulos confirmados pelo menu de navegação (`menu-navegacao.ts`), pelas rotas
(`App.tsx`) e pelos módulos de API (`src/modules/**`):

**Principal**
- Dashboard com resumo (total de membros, visitantes, visitantes do mês, pedidos
  de oração abertos, pré-cadastros pendentes, saldo do mês, aniversariantes do
  dia, comunicados ativos, documentos vencendo) — `dashboard/api.ts`
- Bíblia com plano de leitura coletivo
- Cultos (agenda de cultos recorrentes/extraordinários, pregador, mensagem,
  versículo, louvores e responsáveis)
- Devocionais
- Pedidos de Oração (públicos/privados, com visibilidade e status)

**Ministério**
- Louvores (repertório com letra e cifra) e grupos de louvor
- Membros (cadastro completo, perfis, aniversariantes)
- Visitantes (com funil de integração — `EstadoFunilVisitante`)
- Comunicados / Informativos / Avisos (com confirmação de leitura e botões de ação)
- Aniversariantes
- Departamentos (portaria, recepção, limpeza, com líderes e orientações)
- Escalas (sorteio automático de portaria/recepção por culto; limpeza mensal,
  semanal ou por culto; geração em rascunho, publicação e histórico por lote)
- Eventos (banner, inscrições com controle de vagas, lista de inscritos com
  relatório em PDF, lembretes automáticos, compartilhamento no WhatsApp e arte
  para Instagram Stories)

**Administração**
- Aprovação de pré-cadastros
- Financeiro (entradas, saídas, relatórios, saldo)
- Configurações da igreja (PIX para ofertas, logo, cores)
- Central de suporte integrada (abertura de chamados para a equipe WillTech)
- Configurações do usuário (tema claro/escuro, tamanho de fonte)

**Outros recursos confirmados**
- Notificações push no celular (Firebase — `public/firebase-config.js`)
- Site público por igreja (`/i/:slug`) com cultos, eventos, avisos e pedido de oração
- Documentos da igreja (atas, estatutos, contratos, certidões, com controle de validade)
- Ofertas via PIX com chave configurável

> A landing page afirma **"18 módulos integrados"** e **"7 dias de teste grátis"**.
> A contagem de módulos é coerente com o que existe no menu e nas rotas.

---

## 4. Funcionalidades que parecem estar em desenvolvimento / não confirmadas

- **Ambiente de demonstração público (demo pronta):** não existe rota ou link de
  demonstração. O fluxo atual é: solicitar acesso → aprovação → teste de 7 dias.
  **Pendente de confirmação** se há uma igreja/ambiente demo para mostrar sem cadastro.
- **Vídeo do sistema:** não há link de vídeo no projeto. **Pendente de confirmação.**
- **Material em PDF de vendas:** não existe no projeto. **Pendente de confirmação.**
- **Instagram do produto:** confirmado e incluído em `plataforma.ts` e na seção
  de contato da landing — [@minhaigrejadigit](https://www.instagram.com/minhaigrejadigit).
  O "Instagram" nos módulos de eventos continua sendo o compartilhamento de Stories
  pelas próprias igrejas.
- **Detalhamento do que inclui a "configuração inicial e orientação"** da taxa de
  adesão: a landing menciona que inclui, mas não lista itens. **Pendente de confirmação.**

---

## 5. Informações comerciais confirmadas (preços e teste)

> **Confirmado em `src/lib/plano-comercial.ts` e na FAQ da landing (`Landing.tsx`),
> e reforçado em `src/lib/mensagens-comerciais.ts`.**

| Item | Valor confirmado no código |
|------|-----------------------------|
| Plano | **Plano Completo** (plano único de lançamento) |
| Mensal | **R$ 57,00/mês** |
| Anual à vista (PIX) | **R$ 570,00/ano** (equivale a 10 meses — 2 meses grátis; economia de R$ 114,00) |
| Anual no cartão | **12× de R$ 57,00** (mesmo valor do mensal) |
| Taxa de adesão (promoção de lançamento) | **R$ 200,00** — pagamento único, cobrado na ativação após o teste |
| Valor de referência da adesão (riscado) | R$ 700,00 (usado só para mostrar o desconto) |
| Teste grátis | **7 dias**, sem cartão |
| Limite de membros | **Sem limite** no lançamento |

### ⚠️ Divergência importante com os valores citados no pedido

O pedido mencionava: implantação R$ 700,00, mensal R$ 139,90, anual R$ 1.510,92 e
teste de 7 dias. **Esses valores NÃO correspondem ao que está no código.** Os
valores reais e vigentes no projeto são os da tabela acima.

- **R$ 700,00** aparece apenas como *valor de referência riscado* da adesão, não
  como o valor cobrado. O valor cobrado é **R$ 200,00**.
- **Mensal real:** R$ 57,00 (não R$ 139,90).
- **Anual real:** R$ 570,00 à vista no PIX (não R$ 1.510,92).
- **Teste de 7 dias:** confirmado, esse bate.

**Recomendação:** usar sempre os valores do código (R$ 57 / R$ 570 / adesão R$ 200 /
7 dias). Antes de disparar campanhas, **confirmar com o proprietário** se esses
valores continuam vigentes.

---

## 6. Informações que precisam ser confirmadas pelo proprietário

1. Se os preços de lançamento (R$ 57 / R$ 570 / adesão R$ 200) continuam válidos.
2. O que exatamente está incluso na "configuração inicial e orientação" da adesão.
3. Se existe ambiente de demonstração (ou igreja modelo) para mostrar sem cadastro.
4. Se há vídeo de apresentação do sistema.
5. ~~Perfil de Instagram oficial~~ — **confirmado e publicado** na landing/`plataforma.ts`: [@minhaigrejadigit](https://www.instagram.com/minhaigrejadigit).
6. Horário e canal de suporte (a landing cita suporte pela plataforma, mas **não**
   há promessa de "suporte 24h" — não prometer isso).
7. Situação de LGPD/conformidade jurídica (não afirmar conformidade sem confirmação).
8. Se há política de cancelamento/reembolso além do "sem multa" citado na FAQ.

---

## 7. Problemas reais que o sistema resolve (compatíveis com os recursos)

- Informações de membros espalhadas em cadernos e planilhas → **módulo de Membros**.
- Dificuldade de acompanhar visitantes → **Visitantes com funil de integração**.
- Eventos e inscrições desorganizados → **Eventos com inscrições, vagas e PDF**.
- Escalas de portaria/recepção/limpeza no grupo de WhatsApp → **módulo de Escalas
  com sorteio e publicação**.
- Avisos que não chegam a todos → **Comunicados/Informativos + notificação push**.
- Documentos da igreja em locais diferentes → **Documentos da igreja**.
- Ofertas e finanças sem centralização → **Financeiro + PIX**.
- Falta de uma plataforma única acessível no celular → **tudo em um só lugar, web**.

---

## 8. Proposta de valor recomendada

**Frase de posicionamento principal (até 2 linhas):**

> O Minha Igreja Digital reúne membros, visitantes, escalas, eventos, comunicação
> e financeiro da sua igreja em uma só plataforma, simples e acessível no celular.

**Descrição em uma frase:**

> Uma plataforma web que centraliza a gestão da igreja — pessoas, comunicação,
> escalas, eventos e finanças — no computador e no celular.

**Descrição de 30 segundos:**

> O Minha Igreja Digital é uma plataforma feita para igrejas organizarem tudo em
> um só lugar: cadastro de membros e visitantes, escalas de portaria e limpeza,
> eventos com inscrições, avisos que chegam por notificação no celular, documentos
> da igreja e o financeiro com PIX. Funciona no navegador, sem instalar aplicativo,
> e cada pessoa acessa conforme o seu papel — pastor, secretaria, tesouraria ou
> liderança. Tem 7 dias de teste grátis para a igreja conhecer sem compromisso.

**Apresentação de até 100 palavras:**

> Muitas igrejas têm as informações divididas entre planilhas, cadernos e grupos de
> WhatsApp. O Minha Igreja Digital foi criado para reunir tudo em uma plataforma só.
> A secretaria organiza membros e visitantes; a liderança monta escalas de portaria,
> recepção e limpeza com sorteio automático; os eventos ganham inscrições e lista de
> presença; os avisos chegam por notificação no celular; e a tesouraria acompanha
> entradas, saídas e ofertas via PIX. Cada pessoa acessa conforme o seu papel, de
> qualquer aparelho, sem instalar nada. A igreja pode testar 7 dias grátis, sem
> compromisso, e decidir com calma. Desenvolvido pela WillTech Solutions Dev.

**Três propostas de valor:**
1. Centralização: tudo o que hoje está em planilhas, cadernos e grupos passa a
   ficar em um único lugar, acessível no celular.
2. Organização por papéis: cada função da igreja (secretaria, tesouraria,
   liderança) tem sua área, com registro e histórico.
3. Comunicação que chega: avisos e lembretes por notificação no celular, além do
   compartilhamento de eventos no WhatsApp.

**Cinco benefícios principais:**
1. Menos tempo com burocracia e mais tempo com as pessoas.
2. Escalas de portaria, recepção e limpeza sem depender de planilha ou grupo.
3. Eventos com inscrições, vagas e lista de presença organizados.
4. Finanças e ofertas via PIX centralizadas, com relatórios.
5. Acesso pelo celular, sem instalar aplicativo, e 7 dias de teste grátis.

---

## 9. Perfil de igreja com maior potencial

1. **Igreja de porte pequeno a médio, em crescimento**, onde a secretaria já
   sente que planilhas e cadernos não dão mais conta.
2. **Igreja com muitos eventos e escalas** (portaria, recepção, limpeza), que
   hoje organiza tudo em grupos de WhatsApp.
3. **Igreja com equipe administrativa definida** (secretário/tesoureiro/líderes),
   que consegue alimentar o sistema e valoriza organização e histórico.

---

## 10. Elementos da landing que ajudam ou atrapalham a conversão

Resumo aqui; detalhamento completo em `docs/melhorias-landing-page.md`.

**Ajudam:**
- Slider com benefícios claros e screenshots reais do sistema.
- Seção de módulos bem organizada e FAQ que responde objeções comuns.
- Preço transparente com comparação mensal x anual e teste grátis destacado.
- Canais de contato (WhatsApp, telefone, e-mail) visíveis.

**Atrapalham / pontos de atenção:**
- Não há botão/seção dedicada a "ver demonstração" (só "teste grátis" via cadastro).
- Falta prova social (a ausência é correta — não inventar — mas reduz conversão).
- O bloco "Informativos comerciais e institucionais" tem título confuso para o público.
- O número "18 módulos" pode gerar dúvida se não estiver alinhado com a lista.

---

## Anexo — Partes do projeto analisadas

- `src/pages/Landing.tsx` (landing page completa)
- `src/lib/plataforma.ts` (marca, contatos, textos)
- `src/lib/plano-comercial.ts` (planos e preços)
- `src/lib/mensagens-comerciais.ts` (mensagens comerciais já existentes)
- `src/App.tsx` (rotas)
- `src/components/layout/menu-navegacao.ts` e `Sidebar.tsx` (menus/módulos)
- `src/pages/SolicitarAcesso.tsx` (formulário de cadastro/teste)
- `src/modules/dashboard/api.ts` (métricas do dashboard)
- `src/modules/**` (módulos de API: membros, visitantes, escalas, eventos, etc.)
- `backend/.../enumeration/PerfilAcesso.java` (perfis de acesso)
- `backend/.../enumeration/*` (enums de domínio: eventos, escalas, oração, etc.)
- `public/firebase-config.js` (push notifications)
- `public/landing/*` (screenshots: dashboard, membros, financeiro, pix, configuracoes, suporte)
- `README.md`
