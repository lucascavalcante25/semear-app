export type MensagensComerciais = {
  mensagemAbordagem?: string;
  mensagemPreco?: string;
  mensagemDemo?: string;
  mensagemFimTeste?: string;
  whatsappContato?: string;
  emailContato?: string;
};

export const MENSAGENS_PADRAO: MensagensComerciais = {
  mensagemAbordagem: `Olá, {nomePastor}. Tudo bem?

Meu nome é Lucas, sou desenvolvedor de software.

Tenho conversado com igrejas que buscam reunir em um só lugar informações que hoje ficam divididas entre planilhas, cadernos e grupos de WhatsApp. Foi pensando nisso que criei o Minha Igreja Digital.

Ele ajuda a organizar membros, visitantes, escalas, eventos, avisos e o financeiro — no computador e no celular, sem instalar aplicativo.

Seria inconveniente eu enviar uma demonstração rápida para o senhor conhecer, sem compromisso?`,
  mensagemPreco: `{nomePastor}, com prazer. Antes dos números, um detalhe importante: o plano é completo, sem limite de membros no lançamento, e dá para testar 7 dias grátis antes de qualquer pagamento.

✅ Teste grátis por 7 dias
✅ Plano mensal: {valorMensal}/mês
✅ Plano anual à vista no PIX: {valorAnual}/ano (equivale a 10 meses — 2 meses grátis)
✅ Taxa de adesão promocional: R$ 200,00 (pagamento único, na ativação)

No cartão, o anual pode ser parcelado em 12× de {valorMensal} (mesmo valor do mensal).

O que precisaria fazer parte do sistema para esse investimento fazer sentido para a igreja?`,
  mensagemDemo: `{nomePastor}, imagino que a rotina aí seja corrida, então serei breve.

Em uns 15 minutos eu consigo mostrar como a igreja pode organizar membros, visitantes, escalas, eventos, avisos e o financeiro em um único lugar — direto no celular.

É sem compromisso nenhum. Seria inconveniente marcarmos um horário rápido nesta semana?`,
  mensagemFimTeste: `Olá, {nomePastor}. Tudo bem?

O teste grátis da {nomeIgreja} no Minha Igreja Digital está chegando ao fim.

Como foi a experiência da equipe até aqui? O que mais ajudou no dia a dia?

Se fizer sentido continuar, a ativação fica assim:

• Mensal: {valorMensal}/mês
• Anual à vista no PIX: {valorAnual} (2 meses grátis)
• Anual no cartão: 12× de {valorMensal}

E se este não for um bom momento, sem problema — basta me avisar. Como o senhor prefere seguir?`,
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
