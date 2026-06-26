/**
 * Gera ícones PWA a partir das folhas verdes (public/logo-semear.png).
 * Fundo verde da marca — evita quadrado preto no splash Android.
 * Uso: node scripts/generate-pwa-icons.mjs
 */
import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origem = path.join(root, "public/logo-semear.png");
const outDir = path.join(root, "public/brand");

/** Verde oliva da marca (#5a7a3a) — alinhado ao theme_color do manifest */
const FUNDO = { r: 90, g: 122, b: 58, alpha: 1 };

async function gerarIcone(arquivo, px, escalaLogo = 0.55) {
  const tamanhoLogo = Math.round(px * escalaLogo);
  const logoBuffer = await sharp(origem)
    .resize(tamanhoLogo, tamanhoLogo, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const destino = path.join(outDir, arquivo);
  await sharp({
    create: { width: px, height: px, channels: 4, background: FUNDO },
  })
    .composite([{ input: logoBuffer, gravity: "center" }])
    .png()
    .toFile(destino);
  console.log(`OK ${arquivo} (${px}x${px})`);
}

const tamanhos = [
  ["apple-touch-icon.png", 180, 0.5],
  ["logo-icon.png", 192, 0.52],
  ["logo-icon-512.png", 512, 0.48],
  ["logo-icon-maskable-512.png", 512, 0.38],
  ["favicon-16.png", 16, 0.7],
  ["favicon-32.png", 32, 0.65],
];

for (const [arquivo, px, escala] of tamanhos) {
  await gerarIcone(arquivo, px, escala);
}

await sharp(origem)
  .resize(32, 32, { fit: "contain", background: FUNDO })
  .toFile(path.join(root, "public/favicon.ico"));
console.log("OK favicon.ico");
