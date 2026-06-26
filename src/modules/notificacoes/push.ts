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

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;
let configBackend: PushConfigPublica | null = null;

export async function verificarSuportePush(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("Notification" in window)) {
    return false;
  }
  try {
    const suportado = await isSupported();
    if (!suportado) return false;
    configBackend = await obterConfigPush();
    return configBackend.disponivel === true;
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

export async function obterTokenFCM(): Promise<string | null> {
  const config = await obterConfigPushCache();
  if (!config?.disponivel || !config.vapidPublicKey) {
    return null;
  }
  const firebaseApp = obterAppFirebase();
  messaging = getMessaging(firebaseApp);
  const swRegistration = await registrarServiceWorker();
  const token = await getToken(messaging, {
    vapidKey: config.vapidPublicKey,
    serviceWorkerRegistration: swRegistration,
  });
  return token || null;
}

export async function ativarPushCompleto(): Promise<boolean> {
  const suportado = await verificarSuportePush();
  if (!suportado) return false;

  const permissao = await solicitarPermissaoPush();
  if (permissao !== "granted") return false;

  const token = await obterTokenFCM();
  if (!token) return false;

  await registrarTokenNoBackend(token);
  configurarListenerForeground();
  return true;
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
    const title = payload.notification?.title || payload.data?.title;
    const body = payload.notification?.body || payload.data?.body;
    if (title && Notification.permission === "granted") {
      const notification = new Notification(title, {
        body: body || "",
        icon: "/brand/android-chrome-192x192.png",
        data: { url: payload.data?.url || "/" },
      });
      notification.onclick = () => {
        const url = payload.data?.url || "/";
        window.focus();
        window.location.href = url;
        notification.close();
      };
    }
  });
}

export function tratarCliqueNotificacao(url?: string) {
  const destino = url && url.startsWith("/") ? url : "/";
  window.location.href = destino;
}
