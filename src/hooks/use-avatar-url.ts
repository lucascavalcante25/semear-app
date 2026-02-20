import { useEffect, useState } from "react";
import { URL_BASE_API, obterToken } from "@/modules/api/client";

/**
 * Retorna a URL do avatar do usuário atual (object URL após fetch com auth).
 * Limpa o object URL ao desmontar.
 */
export function useAvatarUrlCurrentUser(): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!URL_BASE_API) return;

    let objectUrl: string | null = null;

    const load = async () => {
      try {
        const token = obterToken();
        const res = await fetch(`${URL_BASE_API}/api/account/avatar`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const blob = await res.blob();
          objectUrl = URL.createObjectURL(blob);
          setUrl(objectUrl);
        }
      } catch {
        setUrl(null);
      }
    };

    void load();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  return url;
}

/**
 * Retorna a URL do avatar de um usuário por ID (object URL após fetch com auth).
 */
export function useAvatarUrlByUserId(userId: string | number | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!URL_BASE_API || !userId) {
      setUrl(null);
      return;
    }

    let objectUrl: string | null = null;

    const load = async () => {
      try {
        const token = obterToken();
        const res = await fetch(`${URL_BASE_API}/api/avatars/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const blob = await res.blob();
          objectUrl = URL.createObjectURL(blob);
          setUrl(objectUrl);
        } else {
          setUrl(null);
        }
      } catch {
        setUrl(null);
      }
    };

    void load();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [userId]);

  return url;
}
