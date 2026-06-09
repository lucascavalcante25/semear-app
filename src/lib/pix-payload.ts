/** Gera payload EMV estático PIX (BR Code) para QR Code. */

const formatarCampo = (id: string, valor: string): string => {
  const tamanho = String(valor.length).padStart(2, "0");
  return `${id}${tamanho}${valor}`;
};

const crc16 = (payload: string): string => {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
    crc &= 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
};

const tipoChaveParaCodigo = (tipo?: string): string => {
  switch (tipo) {
    case "CPF":
      return "01";
    case "CNPJ":
      return "02";
    case "EMAIL":
      return "03";
    case "TELEFONE":
      return "04";
    case "CHAVE_ALEATORIA":
      return "05";
    default:
      return "02";
  }
};

const normalizar = (texto: string, max: number) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .toUpperCase()
    .slice(0, max);

export function gerarPayloadPix(params: {
  chavePix: string;
  tipoChavePix?: string;
  nomeTitular?: string;
  cidade?: string;
}): string {
  const chave = params.chavePix.replace(/\D/g, "").length >= 11
    ? params.chavePix.replace(/\D/g, "")
    : params.chavePix;
  const nome = normalizar(params.nomeTitular || "IGREJA", 25);
  const cidade = normalizar(params.cidade || "BRASIL", 15);

  const gui = formatarCampo("00", "br.gov.bcb.pix");
  const chaveInfo = formatarCampo("01", chave);
  const merchantAccount = formatarCampo("26", gui + chaveInfo);
  const payloadSemCrc =
    formatarCampo("00", "01") +
    merchantAccount +
    formatarCampo("52", "0000") +
    formatarCampo("53", "986") +
    formatarCampo("58", "BR") +
    formatarCampo("59", nome) +
    formatarCampo("60", cidade) +
    formatarCampo("62", formatarCampo("05", "***")) +
    "6304";

  return payloadSemCrc + crc16(payloadSemCrc);
}

export function labelTipoChave(tipo?: string): string {
  switch (tipo) {
    case "CPF":
      return "CPF";
    case "CNPJ":
      return "CNPJ";
    case "EMAIL":
      return "E-mail";
    case "TELEFONE":
      return "Telefone";
    case "CHAVE_ALEATORIA":
      return "Chave aleatória";
    default:
      return "Chave PIX";
  }
}
