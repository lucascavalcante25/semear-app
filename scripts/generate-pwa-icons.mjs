/**
 * Gera ícones PWA a partir do SVG oficial da plataforma (public/brand/logo-icon.svg).
 * Uso: node scripts/generate-pwa-icons.mjs
 */
import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const svg = path.join(root, "public/brand/logo-icon.svg");
const outDir = path.join(root, "public/brand");

const tamanhos = [
  ["apple-touch-icon.png", 180],
  ["logo-icon.png", 192],
  ["logo-icon-512.png", 512],
  ["favicon-16.png", 16],
  ["favicon-32.png", 32],
];

for (const [arquivo, px] of tamanhos) {
  const destino = path.join(outDir, arquivo);
  await sharp(svg).resize(px, px).png().toFile(destino);
  console.log(`OK ${arquivo} (${px}x${px})`);
}

await sharp(svg).resize(32, 32).toFile(path.join(root, "public/favicon.ico"));
console.log("OK favicon.ico");
