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
✅ Implantação: R$ 700,00
✅ Mensalidade: R$ 139,90/mês

Também temos a opção anual no PIX:
R$ 1.510,92 com 10% de desconto.

Promoção no pagamento anual no PIX:
A implantação sai por R$ 500,00 (em vez de R$ 700,00) + R$ 1.510,92/ano no PIX.

O sistema funciona no computador e no celular, sem precisar instalar aplicativo.`,
  mensagemDemo: `Pastor, posso te mostrar uma demonstração rápida do Minha Igreja Digital?

Em poucos minutos eu consigo te mostrar como a igreja pode organizar membros, visitantes, financeiro, avisos, louvores, devocionais e ofertas via PIX em um único lugar.`,
  mensagemFimTeste: `Olá, pastor. Tudo bem?

O teste grátis da sua igreja no Minha Igreja Digital está chegando ao fim.

Para continuar usando a plataforma, podemos ativar sua assinatura no Plano Completo por R$ 139,90/mês.

Também temos a opção anual no PIX com desconto.`,
};

export type PlaceholdersMensagem = {
  nomePastor?: string;
  nomeIgreja?: string;
  diasRestantes?: string | number;
  valorMensal?: string;
  valorImplantacao?: string;
  valorAnual?: string;
};

export function aplicarPlaceholders(texto: string, dados: PlaceholdersMensagem): string {
  return texto
    .replaceAll("{nomePastor}", dados.nomePastor ?? "pastor")
    .replaceAll("{nomeIgreja}", dados.nomeIgreja ?? "sua igreja")
    .replaceAll("{diasRestantes}", String(dados.diasRestantes ?? "X"))
    .replaceAll("{valorMensal}", dados.valorMensal ?? "R$ 139,90")
    .replaceAll("{valorImplantacao}", dados.valorImplantacao ?? "R$ 700,00")
    .replaceAll("{valorAnual}", dados.valorAnual ?? "R$ 1.510,92");
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
  valorImplantacaoContratado?: number;
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
    valorImplantacao: fmt(dados.valorImplantacaoContratado),
    valorAnual: fmt(dados.valorAnualContratado),
  };
}

export function mensagemParaIgreja(
  template: string,
  dados: DadosIgrejaMensagem,
): string {
  return aplicarPlaceholders(template, placeholdersDeAssinatura(dados));
}
