/**
 * Captura screenshots reais do app para a landing page.
 *
 * Uso:
 *   npm run dev   (em outro terminal, com VITE_API_URL apontando para a API)
 *   npm run screenshots:landing
 *
 * Variáveis opcionais:
 *   SCREENSHOT_BASE_URL  (padrão: http://localhost:5173)
 *   SCREENSHOT_API_URL   (padrão: VITE_API_URL ou https://semear-api-pl65.onrender.com)
 *   SCREENSHOT_USER      (padrão: 11111111111)
 *   SCREENSHOT_PASSWORD  (padrão: admin@SemearApp)
 */
import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../public/landing");

const BASE_URL = (process.env.SCREENSHOT_BASE_URL || "http://localhost:5173").replace(/\/$/, "");
const API_URL = (
  process.env.SCREENSHOT_API_URL ||
  process.env.VITE_API_URL ||
  "https://semear-api-pl65.onrender.com"
).replace(/\/$/, "");
const USER = process.env.SCREENSHOT_USER || "11111111111";
const PASSWORD = process.env.SCREENSHOT_PASSWORD || "admin@SemearApp";

const PAGES = [
  { file: "dashboard.png", path: "/", selector: "main" },
  { file: "membros.png", path: "/membros", selector: "main" },
  { file: "financeiro.png", path: "/financeiro", selector: "main" },
  { file: "pix.png", path: "/configuracoes-igreja?aba=pix", selector: "main" },
  { file: "configuracoes.png", path: "/configuracoes", selector: "main" },
  { file: "suporte.png", path: "/suporte", selector: "main" },
];

async function autenticarNaApi() {
  const authRes = await fetch(`${API_URL}/api/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username: USER, password: PASSWORD, rememberMe: true }),
  });
  if (!authRes.ok) {
    throw new Error(`Falha ao autenticar na API (${authRes.status})`);
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
  const prioridade = ["ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_SECRETARIA", "ROLE_TESOURARIA", "ROLE_LIDER", "ROLE_MEMBRO"];
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

async function aguardarApp(page) {
  await page.waitForLoadState("networkidle", { timeout: 45_000 }).catch(() => undefined);
  await page.waitForTimeout(2000);
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

async function capturar(page, { file, path: rota, selector }) {
  await page.goto(`${BASE_URL}${rota}`, { waitUntil: "domcontentloaded" });
  await aguardarApp(page);

  const alvo = page.locator(selector).first();
  await alvo.waitFor({ state: "visible", timeout: 30_000 });

  const destino = path.join(OUT_DIR, file);
  await alvo.screenshot({ path: destino, animations: "disabled" });
  console.log(`✓ ${file}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  console.log(`API: ${API_URL}`);
  console.log(`App: ${BASE_URL}`);
  const { token, usuario } = await autenticarNaApi();

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
    colorScheme: "light",
  });
  const page = await context.newPage();

  try {
    await prepararSessao(page, token, usuario);

    for (const item of PAGES) {
      await capturar(page, item);
    }

    console.log(`\nScreenshots salvos em public/landing/`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
