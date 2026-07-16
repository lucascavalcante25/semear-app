import { Icon } from "@iconify/react";
import { ChevronDown, ImageIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  compartilharEventoInstagramFeed,
  compartilharEventoInstagramStories,
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
  const [carregando, setCarregando] = useState<"whatsapp" | "stories" | "feed" | null>(null);
  const opcoes = { nomeIgreja };

  if (!evento.id) return null;

  const noWhatsApp = async () => {
    setCarregando("whatsapp");
    try {
      const modo = await compartilharEventoWhatsApp(evento, opcoes);
      toast.success(
        modo === "imagem"
          ? "Escolha o WhatsApp para enviar com a imagem."
          : "Abrindo WhatsApp com o convite.",
      );
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      toast.error("Não foi possível compartilhar no WhatsApp.");
    } finally {
      setCarregando(null);
    }
  };

  const noStories = async () => {
    setCarregando("stories");
    try {
      const modo = await compartilharEventoInstagramStories(evento, opcoes);
      if (modo === "compartilhado") {
        toast.success("Escolha o Instagram Stories. A legenda foi copiada.");
      } else {
        toast.success(
          evento.imagemUrl
            ? "Banner baixado e legenda copiada. Abra o Instagram → Stories e selecione a imagem."
            : "Legenda copiada. Cole no Instagram Stories.",
        );
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      toast.error("Não foi possível preparar o Stories.");
    } finally {
      setCarregando(null);
    }
  };

  const noFeed = async () => {
    setCarregando("feed");
    try {
      const modo = await compartilharEventoInstagramFeed(evento, opcoes);
      if (modo === "compartilhado") {
        toast.success("Escolha o Instagram. A legenda do feed foi copiada.");
      } else {
        toast.success(
          evento.imagemUrl
            ? "Banner baixado e legenda copiada. Abra o Instagram → Nova publicação e cole a legenda."
            : "Legenda copiada. Cole na publicação do feed.",
        );
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      toast.error("Não foi possível preparar o feed.");
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={ocupado}
            aria-label="Compartilhar no Instagram"
            className={cn(
              "h-10 rounded-none bg-background gap-1.5 font-medium touch-manipulation",
              "text-[#C13584] hover:bg-[#E1306C]/10 hover:text-[#833AB4]",
            )}
          >
            {carregando === "stories" || carregando === "feed" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Icon icon="mdi:instagram" className="h-[18px] w-[18px] shrink-0" />
            )}
            Instagram
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            disabled={ocupado}
            onSelect={() => void noStories()}
          >
            <ImageIcon className="h-4 w-4 text-[#C13584]" />
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">Stories</span>
              <span className="text-[11px] text-muted-foreground leading-none">
                Status / stories da igreja
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            disabled={ocupado}
            onSelect={() => void noFeed()}
          >
            <Icon icon="mdi:instagram" className="h-4 w-4 text-[#C13584]" />
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">Feed</span>
              <span className="text-[11px] text-muted-foreground leading-none">
                Publicação no feed
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
