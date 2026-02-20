/**
 * API ViaCEP - busca endereço por CEP
 * https://viacep.com.br/
 */

export type ViaCepResponse = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
};

export async function buscarCep(cep: string): Promise<ViaCepResponse | null> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    const data = (await res.json()) as ViaCepResponse;
    if (data.erro) return null;
    return data;
  } catch {
    return null;
  }
}
