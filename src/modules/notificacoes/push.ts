import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getMessaging, getToken, isSupported, onMessage, type Messaging } from "firebase/messaging";
import {
  obterConfigPush,
  registrarDispositivoPush,
  type PushConfigPublica,
} from "./api";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

function firebaseConfigValida(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId
  );
}

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;
let configBackend: PushConfigPublica | null = null;

export async function verificarSuportePush(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("Notification" in window)) {
    return false;
  }
  if (!firebaseConfigValida()) {
    return false;
  }
  try {
    const suportado = await isSupported();
    if (!suportado) return false;
    configBackend = await obterConfigPush();
    return configBackend.disponivel === true && Boolean(configBackend.vapidPublicKey);
  } catch {
    return false;
  }
}

export async function obterConfigPushCache(): Promise<PushConfigPublica | null> {
  if (configBackend) return configBackend;
  try {
    configBackend = await obterConfigPush();
    return configBackend;
  } catch {
    return null;
  }
}

function obterAppFirebase(): FirebaseApp {
  if (!app) {
    const existente = getApps();
    app = existente.length > 0 ? existente[0]! : initializeApp(firebaseConfig);
  }
  return app;
}

async function registrarServiceWorker(): Promise<ServiceWorkerRegistration> {
  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
    scope: "/",
  });
  await navigator.serviceWorker.ready;
  return registration;
}

function detectarPlataforma(): string {
  const ua = navigator.userAgent.toLowerCase();
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone);
  if (/iphone|ipad|ipod/.test(ua)) {
    return standalone ? "IOS_PWA" : "WEB_PWA";
  }
  if (/android/.test(ua)) {
    return standalone ? "ANDROID_PWA" : "WEB_PWA";
  }
  return "WEB_PWA";
}

function detectarNavegador(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome/")) return "Chrome";
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Safari/") && !ua.includes("Chrome")) return "Safari";
  return "Outro";
}

export async function solicitarPermissaoPush(): Promise<NotificationPermission> {
  return Notification.requestPermission();
}

export async function obterTokenFCM(): Promise<string> {
  const config = await obterConfigPushCache();
  if (!config?.disponivel || !config.vapidPublicKey) {
    throw new Error("Push indisponível no servidor (config ou VAPID ausente).");
  }
  if (!firebaseConfigValida()) {
    throw new Error(
      "Firebase não configurado no frontend. Confira VITE_FIREBASE_* na Vercel e faça redeploy."
    );
  }

  try {
    const firebaseApp = obterAppFirebase();
    messaging = getMessaging(firebaseApp);
    const swRegistration = await registrarServiceWorker();
    const token = await getToken(messaging, {
      vapidKey: config.vapidPublicKey,
      serviceWorkerRegistration: swRegistration,
    });
    if (!token) {
      throw new Error("Token FCM vazio após registro.");
    }
    return token;
  } catch (erro) {
    const detalhe = erro instanceof Error ? erro.message : String(erro);
    throw new Error(`Não foi possível obter token push: ${detalhe}`);
  }
}

export async function ativarPushCompleto(): Promise<void> {
  const suportado = await verificarSuportePush();
  if (!suportado) {
    throw new Error("Push não suportado neste dispositivo ou ambiente.");
  }

  const permissao = await solicitarPermissaoPush();
  if (permissao !== "granted") {
    throw new Error("Permissão de notificação negada.");
  }

  const token = await obterTokenFCM();
  await registrarTokenNoBackend(token);
  configurarListenerForeground();
}

export async function registrarTokenNoBackend(token: string): Promise<void> {
  await registrarDispositivoPush({
    token,
    plataforma: detectarPlataforma(),
    navegador: detectarNavegador(),
    userAgent: navigator.userAgent.slice(0, 500),
  });
}

export async function desativarPushLocal(): Promise<void> {
  const { desativarPush } = await import("./api");
  await desativarPush();
}

function configurarListenerForeground() {
  if (!messaging) return;
  onMessage(messaging, (payload) => {
    const title = payload.data?.title || payload.notification?.title;
    const body = payload.data?.body || payload.notification?.body;
    const url = payload.data?.url || "/";
    const notificationId = payload.data?.notificationId || "";
    const tipo = payload.data?.tipo || "";
    if (!title || Notification.permission !== "granted") return;

    const tag = notificationId || (tipo ? `${tipo}:${title}` : title);

    void navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        body: body || "",
        icon: "/brand/android-chrome-192x192.png",
        badge: "/brand/android-chrome-192x192.png",
        tag,
        renotify: false,
        data: { url, notificationId, tipo },
      });
    });
  });
}

export function tratarCliqueNotificacao(url?: string) {
  const destino = url && url.startsWith("/") ? url : "/";
  window.location.href = destino;
}
