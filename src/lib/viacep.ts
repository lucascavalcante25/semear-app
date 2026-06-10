export type EnderecoViaCep = {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
};

export type ResultadoViaCep =
  | { ok: true; endereco: EnderecoViaCep }
  | { ok: false; motivo: "nao_encontrado" | "erro_rede" | "cep_invalido" };

export async function buscarEnderecoPorCep(cep: string): Promise<ResultadoViaCep> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) {
    return { ok: false, motivo: "cep_invalido" };
  }

  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!res.ok) return { ok: false, motivo: "erro_rede" };
    const data = (await res.json()) as { erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string };
    if (data.erro) return { ok: false, motivo: "nao_encontrado" };
    return {
      ok: true,
      endereco: {
        logradouro: data.logradouro ?? "",
        bairro: data.bairro ?? "",
        localidade: data.localidade ?? "",
        uf: data.uf ?? "",
      },
    };
  } catch {
    return { ok: false, motivo: "erro_rede" };
  }
}

/** Compatível com PreCadastro.tsx */
export async function buscarCep(cep: string) {
  const resultado = await buscarEnderecoPorCep(cep);
  if (!resultado.ok) return null;
  return {
    cep,
    logradouro: resultado.endereco.logradouro,
    bairro: resultado.endereco.bairro,
    localidade: resultado.endereco.localidade,
    uf: resultado.endereco.uf,
  };
}
