import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Select/Popover/Dialog do Radix podem deixar `pointer-events: none` no body
 * quando fechados durante uma navegação — isso impede cliques no menu lateral.
 */
export function LimparBloqueioNavegacao() {
  const { pathname } = useLocation();

  useEffect(() => {
    const body = document.body;
    body.style.pointerEvents = "";
    body.style.overflow = "";
    body.removeAttribute("data-scroll-locked");
  }, [pathname]);

  return null;
}
