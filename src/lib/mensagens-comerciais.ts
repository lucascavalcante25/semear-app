export type MensagensComerciais = {
  mensagemAbordagem?: string;
  mensagemPreco?: string;
  mensagemDemo?: string;
  mensagemFimTeste?: string;
  whatsappContato?: string;
  emailContato?: string;
};

export const MENSAGENS_PADRAO: MensagensComerciais = {
  mensagemAbordagem: `Olá, pastor. Tudo bem?

Eu desenvolvi a plataforma Minha Igreja Digital para ajudar igrejas a organizar membros, visitantes, avisos, louvores, financeiro, devocionais e ofertas via PIX.

Ela funciona no computador e no celular, sem precisar instalar aplicativo.

Estou liberando 7 dias grátis para algumas igrejas testarem.

Posso te enviar uma demonstração?`,
  mensagemPreco: `Pastor, o plano de lançamento do Minha Igreja Digital ficou assim:

✅ Teste grátis por 7 dias
✅ Plano mensal: R$ 57,00/mês
✅ Plano anual à vista no PIX: R$ 570,00/ano (equivalente a 10 meses — 2 meses grátis)
✅ Taxa de adesão promocional: R$ 200,00 (pagamento único na ativação)

No cartão, o anual pode ser parcelado em 12× de R$ 57,00 (mesmo valor do mensal).

O sistema funciona no computador e no celular, sem precisar instalar aplicativo.`,
  mensagemDemo: `Pastor, posso te mostrar uma demonstração rápida do Minha Igreja Digital?

Em poucos minutos eu consigo te mostrar como a igreja pode organizar membros, visitantes, financeiro, avisos, louvores, devocionais e ofertas via PIX em um único lugar.`,
  mensagemFimTeste: `Olá, pastor. Tudo bem?

O teste grátis da sua igreja no Minha Igreja Digital está chegando ao fim.

Para continuar usando a plataforma, podemos ativar sua assinatura:

• Mensal: R$ 57,00/mês
• Anual à vista no PIX: R$ 570,00 (2 meses grátis)
• Anual no cartão: 12× de R$ 57,00`,
};

export type PlaceholdersMensagem = {
  nomePastor?: string;
  nomeIgreja?: string;
  diasRestantes?: string | number;
  valorMensal?: string;
  valorAnual?: string;
};

export function aplicarPlaceholders(texto: string, dados: PlaceholdersMensagem): string {
  return texto
    .replaceAll("{nomePastor}", dados.nomePastor ?? "pastor")
    .replaceAll("{nomeIgreja}", dados.nomeIgreja ?? "sua igreja")
    .replaceAll("{diasRestantes}", String(dados.diasRestantes ?? "X"))
    .replaceAll("{valorMensal}", dados.valorMensal ?? "R$ 57,00")
    .replaceAll("{valorAnual}", dados.valorAnual ?? "R$ 570,00");
}

export async function copiarTexto(texto: string) {
  await navigator.clipboard.writeText(texto);
}

/** Dados da assinatura para preencher placeholders ao copiar mensagem para uma igreja. */
export type DadosIgrejaMensagem = {
  responsavelNome?: string;
  igrejaNome?: string;
  diasRestantesTeste?: number;
  valorMensalContratado?: number;
  valorAnualContratado?: number;
};

export function placeholdersDeAssinatura(dados: DadosIgrejaMensagem): PlaceholdersMensagem {
  const fmt = (v?: number) =>
    v != null ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : undefined;
  const nome = dados.responsavelNome?.trim();
  return {
    nomePastor: nome ? (nome.toLowerCase().startsWith("pastor") ? nome : `Pastor ${nome.split(" ")[0]}`) : undefined,
    nomeIgreja: dados.igrejaNome,
    diasRestantes: dados.diasRestantesTeste,
    valorMensal: fmt(dados.valorMensalContratado),
    valorAnual: fmt(dados.valorAnualContratado),
  };
}

export function mensagemParaIgreja(
  template: string,
  dados: DadosIgrejaMensagem,
): string {
  return aplicarPlaceholders(template, placeholdersDeAssinatura(dados));
}
