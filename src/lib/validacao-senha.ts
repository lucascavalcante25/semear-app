export type NivelSenha = "fraca" | "media" | "forte";

export type ResultadoValidacaoSenha = {
  tamanhoOk: boolean;
  coincidem: boolean;
  nivel: NivelSenha;
  valida: boolean;
};

export function avaliarSenha(senha: string, confirmarSenha: string): ResultadoValidacaoSenha {
  const tamanhoOk = senha.length >= 6;
  const coincidem = senha.length > 0 && senha === confirmarSenha;

  let nivel: NivelSenha = "fraca";
  if (tamanhoOk) {
    const temMaiuscula = /[A-Z]/.test(senha);
    const temMinuscula = /[a-z]/.test(senha);
    const temNumero = /\d/.test(senha);
    const temEspecial = /[^A-Za-z0-9]/.test(senha);
    const pontos = [temMaiuscula, temMinuscula, temNumero, temEspecial, senha.length >= 10].filter(Boolean).length;
    if (pontos >= 4) nivel = "forte";
    else if (pontos >= 2) nivel = "media";
    else nivel = "media";
  }

  return {
    tamanhoOk,
    coincidem,
    nivel: tamanhoOk ? nivel : "fraca",
    valida: tamanhoOk && coincidem,
  };
}
