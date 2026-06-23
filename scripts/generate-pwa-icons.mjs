/**
 * Gera ícones PWA a partir das folhas verdes (public/logo-semear.png).
 * Uso: node scripts/generate-pwa-icons.mjs
 */
import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origem = path.join(root, "public/logo-semear.png");
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
  await sharp(origem)
    .resize(px, px, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .png()
    .toFile(destino);
  console.log(`OK ${arquivo} (${px}x${px})`);
}

await sharp(origem)
  .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 1 } })
  .toFile(path.join(root, "public/favicon.ico"));
console.log("OK favicon.ico");
