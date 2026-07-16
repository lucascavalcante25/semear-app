import { Icon } from "@iconify/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  compartilharEventoInstagram,
  compartilharEventoWhatsApp,
} from "@/lib/compartilhar-evento";
import type { EventoDTO } from "@/modules/eventos/api";
import { cn } from "@/lib/utils";

type Props = {
  evento: EventoDTO;
  nomeIgreja?: string;
  className?: string;
};

export function BotoesCompartilharEvento({ evento, nomeIgreja, className }: Props) {
  const [carregando, setCarregando] = useState<"whatsapp" | "instagram" | null>(null);
  const opcoes = { nomeIgreja };

  if (!evento.id) return null;

  const noWhatsApp = async () => {
    setCarregando("whatsapp");
    try {
      const modo = await compartilharEventoWhatsApp(evento, opcoes);
      toast.success(
        modo === "imagem"
          ? "Escolha o WhatsApp para enviar."
          : "Abrindo WhatsApp com o convite.",
      );
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      toast.error("Não foi possível compartilhar no WhatsApp.");
    } finally {
      setCarregando(null);
    }
  };

  const noInstagram = async () => {
    setCarregando("instagram");
    try {
      const modo = await compartilharEventoInstagram(evento, opcoes);
      if (modo === "compartilhado") {
        toast.success("Escolha o Instagram. A legenda foi copiada — é só colar.");
      } else {
        toast.success(
          evento.imagemUrl
            ? "Imagem baixada e legenda copiada. Abra o Instagram e publique."
            : "Legenda copiada. Cole no Instagram.",
        );
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      toast.error("Não foi possível preparar o compartilhamento no Instagram.");
    } finally {
      setCarregando(null);
    }
  };

  const ocupado = !!carregando;

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border",
        className,
      )}
      role="group"
      aria-label="Compartilhar evento"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={ocupado}
        aria-label="Compartilhar no WhatsApp"
        onClick={() => void noWhatsApp()}
        className={cn(
          "h-10 rounded-none bg-background gap-2 font-medium touch-manipulation",
          "text-[#128C7E] hover:bg-[#25D366]/10 hover:text-[#075E54]",
        )}
      >
        {carregando === "whatsapp" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Icon icon="mdi:whatsapp" className="h-[18px] w-[18px] shrink-0" />
        )}
        WhatsApp
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={ocupado}
        aria-label="Compartilhar no Instagram"
        onClick={() => void noInstagram()}
        className={cn(
          "h-10 rounded-none bg-background gap-2 font-medium touch-manipulation",
          "text-[#C13584] hover:bg-[#E1306C]/10 hover:text-[#833AB4]",
        )}
      >
        {carregando === "instagram" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Icon icon="mdi:instagram" className="h-[18px] w-[18px] shrink-0" />
        )}
        Instagram
      </Button>
    </div>
  );
}
