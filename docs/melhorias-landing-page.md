# Relatório de Melhorias — Landing Page

> Análise da landing page em `src/pages/Landing.tsx`. **Nenhuma alteração foi feita
> no código.** Este é um relatório para avaliação. As mudanças só devem ser aplicadas
> após aprovação (ver seção final).
>
> Cada item segue: **Problema → Local → Impacto comercial → Texto atual → Sugestão →
> Prioridade**.

---

## Item 1 — Preços fixos ("hardcoded") na FAQ podem divergir do card de planos
**Problema:** o card de planos usa valores dinâmicos (`plano?.valorMensal`, `taxaAdesao`,
etc., vindos da API/`plano-comercial.ts`), mas as respostas da FAQ têm os valores
escritos manualmente. Se o plano for alterado no sistema, a FAQ continuará mostrando
os valores antigos.
**Local:** `Landing.tsx`, array `FAQ` (respostas "Como é feito o pagamento?", "Existe
taxa de adesão?").
**Impacto comercial:** ALTO — informação de preço inconsistente na mesma página gera
desconfiança e dúvidas na hora de decidir.
**Texto atual:**
> "Taxa única de adesão promocional de R$ 200,00 na ativação após o teste, mais
> assinatura mensal (R$ 57/mês) ou anual..."
**Sugestão:** usar as mesmas variáveis do card (`formatarMoeda(valorMensal)`,
`taxaAdesao`) também na FAQ, para que os números venham sempre da mesma fonte.
**Prioridade:** Alta.

---

## Item 2 — Não há CTA de "ver demonstração" antes do cadastro
**Problema:** o único caminho de conversão é "Teste grátis", que leva a
`/solicitar-acesso` — um formulário longo (CPF, endereço pessoal completo, dados da
igreja). Não existe forma de "só olhar" o sistema antes de fornecer dados.
**Local:** botões do hero, header, narrativa, preços e CTA final (todos apontam para
`/solicitar-acesso`).
**Impacto comercial:** ALTO — muita fricção para quem só quer conhecer; parte dos
visitantes desiste antes de ver valor.
**Texto atual:** "Testar grátis por 7 dias" / "Admin da igreja — teste grátis".
**Sugestão:** adicionar um CTA secundário do tipo "Ver demonstração" (vídeo, tour de
telas ou ambiente demo), quando esse recurso existir. **Pendente de confirmação** se
há demo/vídeo disponível.
**Prioridade:** Alta.

---

## Item 3 — Título de seção confuso: "Informativos comerciais e institucionais"
**Problema:** o termo "comercial/institucional" soa como linguagem de empresa, não de
igreja. Pode confundir o pastor sobre o que o recurso faz.
**Local:** `Landing.tsx`, seção "Comunicação e oração", card com `CardTitle`
"Informativos comerciais e institucionais".
**Impacto comercial:** MÉDIO — reduz clareza de um recurso que é forte (avisos com
confirmação de leitura).
**Texto atual:** "Informativos comerciais e institucionais".
**Sugestão:** trocar por algo como "Avisos e comunicados para a igreja".
**Prioridade:** Média.

---

## Item 4 — Subtítulo do hero muito longo (excesso de texto)
**Problema:** o primeiro slide lista quase todos os módulos em uma única frase, o que
cansa a leitura e dilui a mensagem principal.
**Local:** `Landing.tsx`, `HERO_SLIDES[0].subtitulo`.
**Impacto comercial:** MÉDIO — a primeira dobra deveria comunicar uma ideia clara em
segundos.
**Texto atual:**
> "Membros, visitantes, cultos, escalas de portaria e limpeza, eventos com inscrições
> e divulgação no WhatsApp, informativos, oração, documentos, louvores, financeiro e
> PIX — no computador e no celular."
**Sugestão:** encurtar para 3–4 destaques, ex.: "Membros, escalas, eventos e finanças
em um só lugar — no computador e no celular." Deixar a lista completa para a seção de
módulos.
**Prioridade:** Média.

---

## Item 5 — Destaque numérico "Docs" é vago
**Problema:** entre os números de destaque (7 dias, 18 módulos, 100% web), aparece
"Docs / documentos da igreja", que não é um número e quebra o padrão.
**Local:** `Landing.tsx`, array `DESTAQUES`.
**Impacto comercial:** BAIXO — pequena perda de clareza visual.
**Texto atual:** `{ valor: "Docs", label: "documentos da igreja" }`.
**Sugestão:** substituir por um número real e verificável (ex.: nº de perfis de acesso)
ou remover, mantendo três destaques fortes.
**Prioridade:** Baixa.

---

## Item 6 — Jargão "Admin da igreja" no botão principal do header
**Problema:** "Admin da igreja — teste grátis" usa termo técnico. O pastor pode não se
identificar como "admin".
**Local:** `Landing.tsx`, header, botão para `/solicitar-acesso`.
**Impacto comercial:** MÉDIO — o CTA mais visível deve falar a língua do pastor.
**Texto atual:** "Admin da igreja — teste grátis" / "Teste grátis (admin)".
**Sugestão:** "Testar grátis por 7 dias" (o detalhe de "primeiro administrador" já é
explicado na página de cadastro).
**Prioridade:** Média.

---

## Item 7 — Ausência de prova visual em uso real
**Problema:** há screenshots das telas, mas não há imagem que mostre o sistema "em uso"
ou explicação de contexto. Não há (corretamente) depoimentos — **não inventar**.
**Local:** `Landing.tsx`, seção `#sistema` (SCREENSHOTS).
**Impacto comercial:** MÉDIO — prova visual ajuda a reduzir a insegurança.
**Texto atual:** "Screenshots reais do painel da igreja. Clique em qualquer imagem para
ampliar."
**Sugestão:** quando houver, incluir um vídeo curto ou GIF de navegação. Só usar
depoimentos reais se e quando existirem clientes que autorizem. **Pendente de confirmação.**
**Prioridade:** Média.

---

## Item 8 — Formulário de teste é longo (fricção)
**Problema:** para iniciar o teste, exige-se CPF, data de nascimento, endereço pessoal
completo, contato de emergência, dados e endereço da igreja. É muita informação antes
de a pessoa experimentar.
**Local:** `src/pages/SolicitarAcesso.tsx`.
**Impacto comercial:** ALTO — abandono de formulário é uma das maiores perdas de
conversão.
**Texto atual:** formulário com 6 blocos obrigatórios.
**Sugestão:** avaliar um cadastro inicial curto (nome, WhatsApp, nome da igreja) e
coletar o restante depois da aprovação/ativação. Requer decisão de produto.
**Prioridade:** Alta.

---

## Item 9 — Verificar links quebrados e botões sem ação
**Problema:** confirmar que todos os `href`/`Link` levam a destinos válidos (âncoras
`#modulos`, `#sistema`, `#precos`, `#faq`, `#contato`; rotas `/login`,
`/solicitar-acesso`; `tel:`, `mailto:`, `wa.me`).
**Local:** header, contato e rodapé.
**Impacto comercial:** MÉDIO — link quebrado no CTA custa conversão direta.
**Texto atual:** N/A (verificação).
**Sugestão:** testar cada link em produção (desktop e celular). Na análise do código,
as âncoras e rotas existem; falta validar em ambiente real.
**Prioridade:** Média.

---

## Item 10 — Consistência do número "18 módulos"
**Problema:** o destaque afirma "18 módulos integrados". É preciso garantir que esse
número corresponda à lista real exibida, para não prometer mais do que se mostra.
**Local:** `DESTAQUES` vs array `MODULOS`.
**Impacto comercial:** BAIXO/MÉDIO — inconsistência mina a credibilidade.
**Texto atual:** `{ valor: "18", label: "módulos integrados" }`.
**Sugestão:** conferir a contagem e manter o número alinhado à lista de módulos; se
possível, gerar o número a partir do próprio array.
**Prioridade:** Baixa.

---

## Resumo por prioridade

| Prioridade | Itens |
|------------|-------|
| **Alta** | 1 (preços na FAQ), 2 (CTA de demonstração), 8 (formulário longo) |
| **Média** | 3, 4, 6, 7, 9 |
| **Baixa** | 5, 10 |

---

# Alterações recomendadas para aprovação

> **Nenhuma destas mudanças foi aplicada.** Aguardando aprovação do proprietário antes
> de qualquer edição no código.

1. **(Alta)** Unificar os valores de preço da FAQ com os do card de planos, usando as
   mesmas variáveis dinâmicas, para eliminar risco de divergência.
2. **(Alta)** Adicionar um CTA secundário de "ver demonstração" (após confirmar que
   existe vídeo/tour/ambiente demo).
3. **(Alta)** Avaliar um formulário de teste mais curto para reduzir o abandono.
4. **(Média)** Renomear "Informativos comerciais e institucionais" para "Avisos e
   comunicados para a igreja".
5. **(Média)** Encurtar o subtítulo do primeiro slide do hero.
6. **(Média)** Trocar o texto do botão "Admin da igreja — teste grátis" por
   "Testar grátis por 7 dias".
7. **(Média)** Verificar todos os links em produção (desktop e celular).
8. **(Baixa)** Ajustar o destaque "Docs" para um número verificável ou removê-lo.
9. **(Baixa)** Garantir que o número "18 módulos" corresponda à lista real.

> Observação: não incluir depoimentos, números de clientes, certificações ou
> promessas (como "suporte 24h") sem confirmação. Esses pontos permanecem
> **pendentes de confirmação**.
