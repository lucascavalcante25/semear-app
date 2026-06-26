export type FormatoRecorte = "round" | "rect" | "banner";

const LARGURA_MAXIMA_BANNER = 1280;

/**
 * Cria uma imagem recortada a partir da área de crop.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  formato: FormatoRecorte = "round",
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas 2d não disponível");
  }

  if (formato === "banner") {
    let largura = pixelCrop.width;
    let altura = pixelCrop.height;
    if (largura > LARGURA_MAXIMA_BANNER) {
      altura = Math.round(altura * (LARGURA_MAXIMA_BANNER / largura));
      largura = LARGURA_MAXIMA_BANNER;
    }
    canvas.width = largura;
    canvas.height = altura;
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      largura,
      altura,
    );
  } else {
    const size = Math.min(pixelCrop.width, pixelCrop.height);
    canvas.width = size;
    canvas.height = size;

    if (formato === "round") {
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
    }

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      size,
      size,
    );

    if (formato === "round") {
      ctx.restore();
    }
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Falha ao criar imagem recortada"));
        }
      },
      "image/jpeg",
      0.92
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });
}
