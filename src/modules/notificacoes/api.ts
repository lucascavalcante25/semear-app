import { apiFetch } from "@/modules/api/client";

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
  return apiFetch<PushConfigPublica>("/api/notificacoes/push/config");
}

export async function obterPreferenciasNotificacao(): Promise<PreferenciasNotificacao> {
  return apiFetch<PreferenciasNotificacao>("/api/notificacoes/preferencias");
}

export async function atualizarPreferenciasNotificacao(
  prefs: PreferenciasNotificacao
): Promise<PreferenciasNotificacao> {
  return apiFetch<PreferenciasNotificacao>("/api/notificacoes/preferencias", {
    method: "PUT",
    body: JSON.stringify(prefs),
  });
}

export async function registrarDispositivoPush(dto: RegistroDispositivoDTO): Promise<void> {
  await apiFetch("/api/notificacoes/push/dispositivos", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function desativarPush(token?: string): Promise<void> {
  await apiFetch("/api/notificacoes/push/desativar", {
    method: "POST",
    body: JSON.stringify(token ? { token } : {}),
  });
}

export async function enviarTestePush(): Promise<void> {
  await apiFetch("/api/notificacoes/teste/me", { method: "POST" });
}
