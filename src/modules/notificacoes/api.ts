import { requisicaoApi } from "@/modules/api/client";

export interface PushConfigPublica {
  disponivel: boolean;
  vapidPublicKey?: string;
  firebaseProjectId?: string;
}

export interface PreferenciasNotificacao {
  pushAtivo?: boolean;
  eventosAtivo?: boolean;
  escalasAtivo?: boolean;
  devocionalAtivo?: boolean;
  avisosGeraisAtivo?: boolean;
  departamentosAtivo?: boolean;
  horarioSilenciosoInicio?: string;
  horarioSilenciosoFim?: string;
  dispositivoRegistrado?: boolean;
}

export interface RegistroDispositivoDTO {
  token: string;
  plataforma?: string;
  navegador?: string;
  userAgent?: string;
}

export async function obterConfigPush(): Promise<PushConfigPublica> {
  return requisicaoApi<PushConfigPublica>("/api/notificacoes/push/config");
}

export async function obterPreferenciasNotificacao(): Promise<PreferenciasNotificacao> {
  return requisicaoApi<PreferenciasNotificacao>("/api/notificacoes/preferencias", { auth: true });
}

export async function atualizarPreferenciasNotificacao(
  prefs: PreferenciasNotificacao
): Promise<PreferenciasNotificacao> {
  return requisicaoApi<PreferenciasNotificacao>("/api/notificacoes/preferencias", {
    method: "PUT",
    auth: true,
    body: prefs,
  });
}

export async function registrarDispositivoPush(dto: RegistroDispositivoDTO): Promise<void> {
  await requisicaoApi("/api/notificacoes/push/dispositivos", {
    method: "POST",
    auth: true,
    body: dto,
  });
}

export async function desativarPush(token?: string): Promise<void> {
  await requisicaoApi("/api/notificacoes/push/desativar", {
    method: "POST",
    auth: true,
    body: token ? { token } : {},
  });
}

export async function enviarTestePush(): Promise<void> {
  await requisicaoApi("/api/notificacoes/teste/me", { method: "POST", auth: true });
}

export async function enviarVersiculoDoDiaTeste(): Promise<void> {
  await requisicaoApi("/api/notificacoes/teste/versiculo-dia", { method: "POST", auth: true });
}

/** Dispara o job completo (todos com push ativo) — só existe no backend dev. */
export async function dispararJobVersiculoDoDiaDev(): Promise<void> {
  await requisicaoApi("/api/notificacoes/dev/disparar-versiculo-dia", { method: "POST", auth: true });
}
