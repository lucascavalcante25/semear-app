/**
 * Máscara para CPF brasileiro: 000.000.000-00
 */
export function aplicarMascaraCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/**
 * Valida CPF (11 dígitos, algoritmo básico)
 */
export function validarCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false; // todos iguais
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i], 10) * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== parseInt(digits[9], 10)) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i], 10) * (11 - i);
  let d2 = (sum * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === parseInt(digits[10], 10);
}

/**
 * Valida e-mail (regex RFC 5322 simplificado)
 */
export function validarEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/**
 * Máscara para CEP brasileiro: 00000-000
 */
export function aplicarMascaraCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

/**
 * Máscara para telefone brasileiro.
 * Aceita: (85) 99999-9999 (celular) ou (85) 9999-9999 (fixo)
 */
export function aplicarMascaraTelefone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : "";
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function extrairDigitosTelefone(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Máscara para data brasileira: dd/mm/aaaa
 */
export function aplicarMascaraData(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/**
 * Converte dd/mm/aaaa para yyyy-mm-dd (formato API)
 */
export function dataMascaraParaApi(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 8) return "";
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const aaaa = digits.slice(4, 8);
  return `${aaaa}-${mm}-${dd}`;
}

/**
 * Valida data dd/mm/aaaa.
 * - Verifica se dia/mês/ano formam uma data real (ex: 31/02 inválido, 29/02/2024 válido em ano bissexto).
 * - Rejeita datas futuras quando usado para nascimento.
 * @param value Data no formato dd/mm/aaaa
 * @param opcoes.rejeitarFuturo Se true (padrão), rejeita datas no futuro (útil para data de nascimento)
 */
export function validarData(
  value: string,
  opcoes?: { rejeitarFuturo?: boolean }
): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 8) return false;

  const dd = parseInt(digits.slice(0, 2), 10);
  const mm = parseInt(digits.slice(2, 4), 10);
  const aaaa = parseInt(digits.slice(4, 8), 10);

  if (dd < 1 || dd > 31) return false;
  if (mm < 1 || mm > 12) return false;
  if (aaaa < 1900 || aaaa > 2100) return false;

  // Verifica se a data existe de fato (ex: 31/04 não existe, 29/02/2024 existe em ano bissexto)
  const d = new Date(aaaa, mm - 1, dd);
  if (d.getFullYear() !== aaaa || d.getMonth() !== mm - 1 || d.getDate() !== dd) {
    return false;
  }

  // Para data de nascimento, não pode ser no futuro
  if (opcoes?.rejeitarFuturo !== false) {
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);
    if (d > hoje) return false;
  }

  return true;
}

/**
 * Retorna mensagem de erro específica para data inválida, ou null se válida.
 * Útil para exibir feedback no formulário.
 */
export function mensagemErroData(value: string, rejeitarFuturo = true): string | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 8) return "Informe a data completa (dd/mm/aaaa).";

  const dd = parseInt(digits.slice(0, 2), 10);
  const mm = parseInt(digits.slice(2, 4), 10);
  const aaaa = parseInt(digits.slice(4, 8), 10);

  if (dd < 1 || dd > 31) return "Dia inválido.";
  if (mm < 1 || mm > 12) return "Mês inválido.";
  if (aaaa < 1900 || aaaa > 2100) return "Ano inválido (use entre 1900 e 2100).";

  const d = new Date(aaaa, mm - 1, dd);
  if (d.getFullYear() !== aaaa || d.getMonth() !== mm - 1 || d.getDate() !== dd) {
    return "Data inexistente (ex: 31/04 ou 29/02 em ano não bissexto).";
  }

  if (rejeitarFuturo) {
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);
    if (d > hoje) return "Data de nascimento não pode ser no futuro.";
  }

  return null;
}
