/**
 * Captura telas do app em formato story (9:16) e gera legendas para posts.
 *
 * Uso:
 *   npm run dev          (frontend em localhost:5173)
 *   npm run screenshots:stories
 *
 * Saída: marketing/stories/
 */
import { chromium, devices } from "playwright";
import { mkdir, writeFile, copyFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../marketing/stories");

const BASE_URL = (process.env.SCREENSHOT_BASE_URL || "http://localhost:5173").replace(/\/$/, "");
const API_URL = (
  process.env.SCREENSHOT_API_URL ||
  process.env.VITE_API_URL ||
  "http://localhost:8080"
).replace(/\/$/, "");
const USER = process.env.SCREENSHOT_USER || "11111111111";
const PASSWORD = process.env.SCREENSHOT_PASSWORD || "admin@SemearApp";

/** @type {Array<{file:string; path:string; auth:boolean; legenda:string; textoStory:string; textoOverlay:string; hashtags:string; selector?:string; scrollY?:number; waitMs?:number}>} */
const STORIES = [
  {
    file: "01-login.png",
    path: "/login",
    auth: false,
    legenda: "Tela de login — acesso seguro para membros e líderes",
    textoOverlay: "Acesse de qualquer lugar",
    textoStory:
      "Membros e líderes entram com CPF e senha — simples, seguro e disponível no celular ou computador.\n\nMinha Igreja Digital · WillTech Solutions Dev",
    hashtags: "#MinhaIgrejaDigital #igreja #tecnologia #pastor",
  },
  {
    file: "02-landing-hero.png",
    path: "/landing",
    auth: false,
    legenda: "Página inicial — sua igreja organizada em um só lugar",
    textoOverlay: "Sua igreja organizada",
    textoStory:
      "Chega de planilhas e grupos de WhatsApp para tudo.\n\nMembros, avisos, financeiro, documentos e muito mais — tudo integrado.\n\nTeste grátis por 7 dias.",
    hashtags: "#gestãodeigreja #igrejaevangélica #sistemaigreja",
    waitMs: 1500,
  },
  {
    file: "03-landing-modulos.png",
    path: "/landing",
    auth: false,
    legenda: "Módulos integrados da plataforma",
    textoOverlay: "12+ módulos integrados",
    textoStory:
      "Membros · Visitantes · Avisos · Louvores · Devocionais · Bíblia · Financeiro · PIX · Documentos · Suporte\n\nUm plano completo para sua igreja.",
    hashtags: "#igrejadigital #ministerio #louvor",
    scrollY: 2200,
    waitMs: 800,
  },
  {
    file: "04-landing-precos.png",
    path: "/landing",
    auth: false,
    legenda: "Planos e preços — teste grátis 7 dias",
    textoOverlay: "A partir de R$ 57/mês",
    textoStory:
      "Plano completo com membros ilimitados.\n\nR$ 57/mês · Anual no PIX com 2 meses grátis · Sem taxa de implantação.\n\nComece seu teste de 7 dias hoje.",
    hashtags: "#igreja #saas #testegratis",
    scrollY: 4200,
    waitMs: 800,
  },
  {
    file: "05-dashboard.png",
    path: "/",
    auth: true,
    legenda: "Dashboard — visão geral da igreja",
    textoOverlay: "Tudo em um painel",
    textoStory:
      "Veja avisos, aniversariantes, finanças e indicadores importantes assim que entrar no sistema.\n\nGestão clara para pastores e líderes.",
    hashtags: "#dashboard #gestão #igreja",
  },
  {
    file: "06-membros.png",
    path: "/membros",
    auth: true,
    legenda: "Cadastro e gestão de membros",
    textoOverlay: "Membros organizados",
    textoStory:
      "Cadastro completo, perfis, aniversariantes e aprovação de pré-cadastros online.\n\nSua secretaria mais eficiente.",
    hashtags: "#membros #secretaria #igreja",
  },
  {
    file: "07-visitantes.png",
    path: "/visitantes",
    auth: true,
    legenda: "Acompanhamento de visitantes",
    textoOverlay: "Cuidado com cada visita",
    textoStory:
      "Registre visitantes, acompanhe integrações e não perca ninguém no caminho.\n\nEvangelismo com organização.",
    hashtags: "#visitantes #evangelismo #igreja",
  },
  {
    file: "08-avisos.png",
    path: "/avisos",
    auth: true,
    legenda: "Avisos e comunicação com a igreja",
    textoOverlay: "Comunique com clareza",
    textoStory:
      "Publique avisos fixos, urgentes e mantenha toda a igreja informada — direto no sistema.",
    hashtags: "#comunicação #avisos #igreja",
  },
  {
    file: "09-louvores.png",
    path: "/louvores",
    auth: true,
    legenda: "Louvores e repertório",
    textoOverlay: "Louvor organizado",
    textoStory:
      "Organize repertório, grupos e escalas do ministério de louvor em um só lugar.",
    hashtags: "#louvor #ministeriodemusica #igreja",
  },
  {
    file: "10-devocionais.png",
    path: "/devocionais",
    auth: true,
    legenda: "Devocionais para edificação",
    textoOverlay: "Edifique a congregação",
    textoStory:
      "Publique devocionais diários e fortaleça a vida espiritual dos membros.",
    hashtags: "#devocional #palavra #igreja",
  },
  {
    file: "11-biblia.png",
    path: "/biblia",
    auth: true,
    legenda: "Bíblia com plano de leitura coletivo",
    textoOverlay: "Leitura bíblica integrada",
    textoStory:
      "Leia a Bíblia no sistema e acompanhe planos de leitura configurados pela sua igreja.",
    hashtags: "#biblia #leiturabiblica #igreja",
    waitMs: 3000,
  },
  {
    file: "12-financeiro.png",
    path: "/financeiro",
    auth: true,
    legenda: "Financeiro da igreja",
    textoOverlay: "Finanças sob controle",
    textoStory:
      "Registre entradas e saídas, acompanhe relatórios e tenha visão clara das finanças da igreja.",
    hashtags: "#financeiro #tesouraria #igreja",
  },
  {
    file: "13-pix.png",
    path: "/configuracoes-igreja?aba=pix",
    auth: true,
    legenda: "Ofertas via PIX configurável",
    textoOverlay: "PIX para ofertas",
    textoStory:
      "Configure a chave PIX da igreja e facilite as ofertas dos membros — tudo dentro do sistema.",
    hashtags: "#pix #ofertas #igreja",
  },
  {
    file: "14-documentos.png",
    path: "/configuracoes-igreja?aba=documentos",
    auth: true,
    legenda: "Documentos da igreja na nuvem",
    textoOverlay: "Documentos seguros",
    textoStory:
      "Guarde atas, estatutos, contratos e certidões em um só lugar — organizados e acessíveis.",
    hashtags: "#documentos #igreja #organização",
    waitMs: 2500,
  },
  {
    file: "15-configuracoes.png",
    path: "/configuracoes-igreja?aba=visual",
    auth: true,
    legenda: "Identidade visual da igreja",
    textoOverlay: "Sua igreja, sua cara",
    textoStory:
      "Personalize cores, logo e identidade visual. Cada igreja com seu próprio ambiente no sistema.",
    hashtags: "#identidadevisual #igreja #personalização",
  },
  {
    file: "16-suporte.png",
    path: "/suporte",
    auth: true,
    legenda: "Central de suporte integrada",
    textoOverlay: "Suporte no sistema",
    textoStory:
      "Dúvidas, erros ou sugestões? Abra um chamado direto no app. A equipe WillTech acompanha cada solicitação.",
    hashtags: "#suporte #saas #igreja",
  },
  {
    file: "17-pre-cadastro.png",
    path: "/pre-cadastro",
    auth: false,
    legenda: "Pré-cadastro online para novos membros",
    textoOverlay: "Cadastro online fácil",
    textoStory:
      "Novos membros se cadastram pela internet. A secretaria aprova com um clique.\n\nMenos papelada, mais pessoas.",
    hashtags: "#precadastro #membros #igreja",
  },
];

async function autenticarNaApi() {
  const authRes = await fetch(`${API_URL}/api/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username: USER, password: PASSWORD, rememberMe: true }),
  });
  if (!authRes.ok) {
    throw new Error(`Falha ao autenticar na API (${authRes.status}). Verifique se o backend está rodando em ${API_URL}`);
  }
  const auth = await authRes.json();
  const token = auth.id_token || auth.token;
  if (!token) throw new Error("Token não retornado pela API");

  const accountRes = await fetch(`${API_URL}/api/account`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!accountRes.ok) {
    throw new Error(`Falha ao obter conta (${accountRes.status})`);
  }
  const account = await accountRes.json();

  const name = [account.firstName, account.lastName].filter(Boolean).join(" ").trim();
  const authorities = account.authorities || [];
  const isSuperAdmin = authorities.includes("ROLE_SUPER_ADMIN");
  const roleMap = {
    ROLE_ADMIN: "admin",
    ROLE_ADMIN_IGREJA: "admin",
    ROLE_PASTOR: "pastor",
    ROLE_SECRETARIA: "secretaria",
    ROLE_TESOURARIA: "tesouraria",
    ROLE_LIDER: "lider",
    ROLE_MEMBRO: "membro",
  };
  const prioridade = [
    "ROLE_ADMIN",
    "ROLE_ADMIN_IGREJA",
    "ROLE_PASTOR",
    "ROLE_SECRETARIA",
    "ROLE_TESOURARIA",
    "ROLE_LIDER",
    "ROLE_MEMBRO",
  ];
  const match = prioridade.find((a) => authorities.includes(a));
  const role = isSuperAdmin && !match ? "super_admin" : roleMap[match] || "admin";

  const usuario = {
    id: String(account.id ?? account.login ?? "0"),
    name: name || account.login || "Usuario",
    email: account.email || account.login || "",
    role,
    isSuperAdmin,
    authorities,
    modules: Array.isArray(account.modules) ? account.modules : undefined,
  };

  return { token, usuario };
}

async function aguardarApp(page, extraMs = 2000) {
  await page.waitForLoadState("networkidle", { timeout: 45_000 }).catch(() => undefined);
  await page.waitForTimeout(extraMs);
}

async function prepararSessao(page, token, usuario) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ({ token, usuario }) => {
      localStorage.setItem("semear.token", token);
      localStorage.setItem("semear.usuario", JSON.stringify(usuario));
    },
    { token, usuario },
  );
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
  await aguardarApp(page);
}

async function capturar(page, item) {
  await page.goto(`${BASE_URL}${item.path}`, { waitUntil: "domcontentloaded" });
  await aguardarApp(page, item.waitMs ?? 2000);

  if (item.scrollY) {
    await page.evaluate((y) => window.scrollTo(0, y), item.scrollY);
    await page.waitForTimeout(600);
  }

  await page.waitForSelector("#root", { state: "attached", timeout: 30_000 });
  await page.waitForTimeout(400);

  const destino = path.join(OUT_DIR, item.file);
  await page.screenshot({ path: destino, fullPage: false, animations: "disabled" });
  console.log(`✓ ${item.file}`);
}

function gerarLegendasMd(itens) {
  const linhas = [
    "# Stories — Minha Igreja Digital",
    "",
    "Imagens em formato **9:16** (1080×1920) prontas para Instagram Stories, WhatsApp Status e Reels.",
    "",
    "Para cada imagem:",
    "- **Legenda**: descrição curta da tela",
    "- **Texto overlay**: frase para colocar como adesivo no story",
    "- **Texto do story**: legenda/caption para copiar e colar",
    "- **Hashtags**: sugestão opcional",
    "",
    "---",
    "",
  ];

  for (const item of itens) {
    linhas.push(`## ${item.file.replace(".png", "").replace(/^\d+-/, "").replace(/-/g, " ")}`);
    linhas.push("");
    linhas.push(`**Arquivo:** \`${item.file}\``);
    linhas.push("");
    linhas.push(`**Legenda:** ${item.legenda}`);
    linhas.push("");
    linhas.push(`**Texto overlay (adesivo no story):**`);
    linhas.push(`> ${item.textoOverlay}`);
    linhas.push("");
    linhas.push(`**Texto do story (copiar e colar):**`);
    linhas.push("```");
    linhas.push(item.textoStory);
    linhas.push("```");
    linhas.push("");
    linhas.push(`**Hashtags:** ${item.hashtags}`);
    linhas.push("");
    linhas.push("---");
    linhas.push("");
  }

  return linhas.join("\n");
}

function gerarLegendasTxt(itens) {
  const blocos = itens.map((item, i) => {
    return [
      `${"=".repeat(60)}`,
      `${i + 1}. ${item.file}`,
      `${"=".repeat(60)}`,
      "",
      `LEGENDA: ${item.legenda}`,
      "",
      `TEXTO OVERLAY: ${item.textoOverlay}`,
      "",
      "TEXTO DO STORY:",
      item.textoStory,
      "",
      `HASHTAGS: ${item.hashtags}`,
      "",
    ].join("\n");
  });

  return [
    "STORIES — MINHA IGREJA DIGITAL",
    "WillTech Solutions Dev",
    "",
    "Copie o texto de cada bloco para publicar no Instagram/WhatsApp.",
    "",
    ...blocos,
  ].join("\n");
}

async function salvarLegendaIndividual(item) {
  const legendaIndividual = path.join(OUT_DIR, item.file.replace(".png", ".txt"));
  await writeFile(
    legendaIndividual,
    [
      `Arquivo: ${item.file}`,
      "",
      `Legenda: ${item.legenda}`,
      "",
      `Texto overlay: ${item.textoOverlay}`,
      "",
      "Texto do story:",
      item.textoStory,
      "",
      `Hashtags: ${item.hashtags}`,
      "",
    ].join("\n"),
    "utf8",
  );
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  console.log(`API: ${API_URL}`);
  console.log(`App: ${BASE_URL}`);

  let credenciais = null;
  try {
    credenciais = await autenticarNaApi();
    console.log("Autenticação OK\n");
  } catch (err) {
    console.warn(`Aviso: ${err.message}`);
    console.warn("Telas autenticadas serão ignoradas.\n");
  }

  const iphone = devices["iPhone 14 Pro Max"];
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...iphone,
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
    colorScheme: "light",
  });
  const page = await context.newPage();

  const capturados = [];

  try {
    const publicas = STORIES.filter((s) => !s.auth);
    const autenticadas = STORIES.filter((s) => s.auth);

    for (const item of publicas) {
      await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
      await page.evaluate(() => {
        localStorage.removeItem("semear.token");
        localStorage.removeItem("semear.usuario");
      });
      await capturar(page, item);
      await salvarLegendaIndividual(item);
      capturados.push(item);
    }

    if (credenciais && autenticadas.length > 0) {
      await prepararSessao(page, credenciais.token, credenciais.usuario);

      for (const item of autenticadas) {
        await capturar(page, item);
        await salvarLegendaIndividual(item);
        capturados.push(item);
      }
    } else if (autenticadas.length > 0) {
      for (const item of autenticadas) {
        console.log(`⊘ ${item.file} (requer autenticação)`);
      }
    }

    const ordenados = STORIES.filter((s) => capturados.some((c) => c.file === s.file));

    await writeFile(path.join(OUT_DIR, "LEGENDAS.md"), gerarLegendasMd(ordenados), "utf8");
    await writeFile(path.join(OUT_DIR, "LEGENDAS.txt"), gerarLegendasTxt(ordenados), "utf8");
    await writeFile(
      path.join(OUT_DIR, "legendas.json"),
      JSON.stringify(
        ordenados.map(({ file, legenda, textoStory, textoOverlay, hashtags }) => ({
          file,
          legenda,
          textoOverlay,
          textoStory,
          hashtags,
        })),
        null,
        2,
      ),
      "utf8",
    );

    console.log(`\n${ordenados.length} imagens em marketing/stories/`);
    console.log("Legendas: LEGENDAS.md, LEGENDAS.txt e um .txt por imagem");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
