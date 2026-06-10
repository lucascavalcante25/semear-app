import {
  validarEmail,
  validarCpf,
  extrairDigitosTelefone,
  validarData,
  dataMascaraParaApi,
} from "@/lib/mascara-telefone";
import { validarCnpj, extrairDigitos } from "@/lib/mascara-documento";
import { ufValida } from "@/lib/ufs-brasil";

export type SexoCadastro = "MASCULINO" | "FEMININO";

export type FormSolicitacaoAcesso = {
  nomeSolicitante: string;
  cpf: string;
  email: string;
  dataNascimento: string;
  sexo: SexoCadastro;
  telefone: string;
  telefoneSecundario: string;
  telefoneEmergencia: string;
  nomeContatoEmergencia: string;
  cepPessoal: string;
  enderecoPessoal: string;
  numeroPessoal: string;
  complementoPessoal: string;
  bairroPessoal: string;
  cidadePessoal: string;
  estadoPessoal: string;
  senha: string;
  confirmarSenha: string;
  nomeIgreja: string;
  cnpjIgreja: string;
  quantidadeMembros: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  mensagem: string;
};

export type ErrosSolicitacao = Partial<Record<keyof FormSolicitacaoAcesso, string>>;

export function validarFormSolicitacao(form: FormSolicitacaoAcesso): ErrosSolicitacao {
  const erros: ErrosSolicitacao = {};

  const nome = form.nomeSolicitante.trim();
  if (!nome) erros.nomeSolicitante = "Nome completo é obrigatório.";
  else if (nome.length < 3) erros.nomeSolicitante = "Mínimo de 3 caracteres.";

  if (!validarCpf(form.cpf)) erros.cpf = "Informe um CPF válido.";

  const email = form.email.trim();
  if (!email) erros.email = "E-mail é obrigatório.";
  else if (!validarEmail(email)) erros.email = "Informe um e-mail válido.";

  if (!form.dataNascimento || !validarData(form.dataNascimento)) {
    erros.dataNascimento = "Informe uma data de nascimento válida.";
  }

  const telefone = extrairDigitosTelefone(form.telefone);
  if (!telefone) erros.telefone = "Telefone principal é obrigatório.";
  else if (telefone.length < 10 || telefone.length > 11) {
    erros.telefone = "Telefone deve ter 10 ou 11 dígitos.";
  }

  if (!form.nomeContatoEmergencia.trim()) {
    erros.nomeContatoEmergencia = "Nome do contato de emergência é obrigatório.";
  }

  const cepPessoal = extrairDigitos(form.cepPessoal);
  if (cepPessoal.length !== 8) erros.cepPessoal = "CEP pessoal deve ter 8 dígitos.";
  if (!form.enderecoPessoal.trim()) erros.enderecoPessoal = "Logradouro pessoal é obrigatório.";
  if (!form.numeroPessoal.trim()) erros.numeroPessoal = "Número pessoal é obrigatório.";
  if (!form.bairroPessoal.trim()) erros.bairroPessoal = "Bairro pessoal é obrigatório.";
  if (!form.cidadePessoal.trim()) erros.cidadePessoal = "Cidade pessoal é obrigatória.";
  if (!ufValida(form.estadoPessoal)) erros.estadoPessoal = "Selecione a UF pessoal.";

  if (!form.senha || form.senha.length < 6) {
    erros.senha = "A senha deve ter ao menos 6 caracteres.";
  }
  if (form.senha !== form.confirmarSenha) {
    erros.confirmarSenha = "As senhas não conferem.";
  }

  const igreja = form.nomeIgreja.trim();
  if (!igreja) erros.nomeIgreja = "Nome da igreja é obrigatório.";
  else if (igreja.length < 3) erros.nomeIgreja = "Mínimo de 3 caracteres.";

  const cnpj = extrairDigitos(form.cnpjIgreja);
  if (cnpj && !validarCnpj(cnpj)) erros.cnpjIgreja = "CNPJ inválido.";

  const cepIgreja = extrairDigitos(form.cep);
  if (cepIgreja && cepIgreja.length !== 8) erros.cep = "CEP da igreja deve ter 8 dígitos.";

  if (!form.cidade.trim()) erros.cidade = "Cidade da igreja é obrigatória.";
  if (!ufValida(form.estado)) erros.estado = "Selecione a UF da igreja.";

  if (form.mensagem.length > 500) erros.mensagem = "Máximo de 500 caracteres.";

  const qtd = form.quantidadeMembros.trim();
  if (qtd) {
    const n = Number(qtd);
    if (!Number.isInteger(n) || n <= 0) erros.quantidadeMembros = "Informe um número positivo.";
  }

  return erros;
}

export type PayloadSolicitacaoAcesso = {
  nomeSolicitante: string;
  cpf: string;
  email: string;
  telefone: string;
  telefoneSecundario?: string;
  telefoneEmergencia?: string;
  nomeContatoEmergencia: string;
  dataNascimento: string;
  sexo: SexoCadastro;
  senha: string;
  cepPessoal: string;
  enderecoPessoal: string;
  numeroPessoal: string;
  complementoPessoal?: string;
  bairroPessoal: string;
  cidadePessoal: string;
  estadoPessoal: string;
  nomeIgreja: string;
  cnpjIgreja?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade: string;
  estado: string;
  quantidadeMembros?: number;
  mensagem?: string;
};

export function normalizarPayloadSolicitacao(form: FormSolicitacaoAcesso): PayloadSolicitacaoAcesso {
  const cnpj = extrairDigitos(form.cnpjIgreja);
  const cepIgreja = extrairDigitos(form.cep);
  const qtd = form.quantidadeMembros.trim();

  const payload: PayloadSolicitacaoAcesso = {
    nomeSolicitante: form.nomeSolicitante.trim(),
    cpf: extrairDigitos(form.cpf),
    email: form.email.trim().toLowerCase(),
    telefone: extrairDigitosTelefone(form.telefone),
    nomeContatoEmergencia: form.nomeContatoEmergencia.trim(),
    dataNascimento: dataMascaraParaApi(form.dataNascimento),
    sexo: form.sexo,
    senha: form.senha,
    cepPessoal: extrairDigitos(form.cepPessoal),
    enderecoPessoal: form.enderecoPessoal.trim(),
    numeroPessoal: form.numeroPessoal.trim(),
    bairroPessoal: form.bairroPessoal.trim(),
    cidadePessoal: form.cidadePessoal.trim(),
    estadoPessoal: form.estadoPessoal.toUpperCase(),
    nomeIgreja: form.nomeIgreja.trim(),
    cidade: form.cidade.trim(),
    estado: form.estado.toUpperCase(),
  };

  const telSec = extrairDigitosTelefone(form.telefoneSecundario);
  const telEmer = extrairDigitosTelefone(form.telefoneEmergencia);
  if (telSec) payload.telefoneSecundario = telSec;
  if (telEmer) payload.telefoneEmergencia = telEmer;
  if (form.complementoPessoal.trim()) payload.complementoPessoal = form.complementoPessoal.trim();
  if (cnpj) payload.cnpjIgreja = cnpj;
  if (cepIgreja) payload.cep = cepIgreja;
  if (form.endereco.trim()) payload.endereco = form.endereco.trim();
  if (form.numero.trim()) payload.numero = form.numero.trim();
  if (form.complemento.trim()) payload.complemento = form.complemento.trim();
  if (form.bairro.trim()) payload.bairro = form.bairro.trim();
  if (form.mensagem.trim()) payload.mensagem = form.mensagem.trim();
  if (qtd) payload.quantidadeMembros = Number(qtd);

  return payload;
}
