import { lazy, type ComponentType, type LazyExoticComponent } from "react";

const CHAVE_RELOAD = "semear:chunk-reload";

function ehErroDeChunk(erro: unknown): boolean {
  const msg = erro instanceof Error ? erro.message : String(erro ?? "");
  return (
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("Importing a module script failed") ||
    msg.includes("error loading dynamically imported module") ||
    msg.includes("Loading chunk") ||
    msg.includes("Loading CSS chunk")
  );
}

/**
 * Após um deploy na Vercel, o JS antigo ainda em memória tenta carregar chunks
 * com hash velho (404). Recarrega uma vez para pegar o index.html novo.
 */
export function lazyComReload<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      const modulo = await factory();
      sessionStorage.removeItem(CHAVE_RELOAD);
      return modulo;
    } catch (erro) {
      if (ehErroDeChunk(erro) && !sessionStorage.getItem(CHAVE_RELOAD)) {
        sessionStorage.setItem(CHAVE_RELOAD, String(Date.now()));
        window.location.reload();
        // Mantém o Suspense pendente enquanto a página recarrega.
        return new Promise(() => undefined) as Promise<{ default: T }>;
      }
      sessionStorage.removeItem(CHAVE_RELOAD);
      throw erro;
    }
  });
}

/** Listener global do Vite para falha de preload de chunks após deploy. */
export function registrarRecuperacaoChunkDeploy(): void {
  window.addEventListener("vite:preloadError", (evento) => {
    evento.preventDefault();
    if (!sessionStorage.getItem(CHAVE_RELOAD)) {
      sessionStorage.setItem(CHAVE_RELOAD, String(Date.now()));
      window.location.reload();
    }
  });
}
