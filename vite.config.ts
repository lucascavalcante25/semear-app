import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

function gerarFirebaseConfig(env: Record<string, string>) {
  return `// Gerado automaticamente pelo Vite — não edite manualmente.
self.FIREBASE_CONFIG = ${JSON.stringify(
    {
      apiKey: env.VITE_FIREBASE_API_KEY || "",
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "",
      projectId: env.VITE_FIREBASE_PROJECT_ID || "",
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: env.VITE_FIREBASE_APP_ID || "",
    },
    null,
    2
  )};
`;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const firebaseConfigContent = gerarFirebaseConfig(env);

  return {
    server: {
      host: "0.0.0.0",
      port: 5173,
      hmr: {
        overlay: false,
      },
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      {
        name: "firebase-sw-config",
        buildStart() {
          fs.writeFileSync(
            path.resolve(__dirname, "public/firebase-config.js"),
            firebaseConfigContent
          );
        },
        configureServer() {
          fs.writeFileSync(
            path.resolve(__dirname, "public/firebase-config.js"),
            firebaseConfigContent
          );
        },
      },
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
