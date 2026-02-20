/**
 * Formata telefone: (00) 00000-0000 ou (00) 0000-0000
 */
export function formatarTelefone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) {
    return digits ? `(${digits}` : "";
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Remove formatação do telefone (apenas dígitos)
 */
export function telefoneApenasDigitos(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Formata CEP: 00000-000
 */
export function formatarCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) {
    return digits;
  }
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

/**
 * Remove formatação do CEP (apenas dígitos)
 */
export function cepApenasDigitos(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Formata valor monetário: 1.234,56 (padrão brasileiro)
 * Aceita apenas dígitos e formata em tempo real.
 */
export function formatarMoeda(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 15);
  if (digits.length === 0) return "";
  const num = parseInt(digits, 10);
  const cents = num % 100;
  const intPart = Math.floor(num / 100);
  const intStr = intPart.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const decStr = String(cents).padStart(2, "0");
  return `${intStr},${decStr}`;
}

/**
 * Converte string formatada (1.234,56) para número.
 */
export function valorMoedaParaNumero(value: string): number {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return 0;
  return parseInt(digits, 10) / 100;
}
