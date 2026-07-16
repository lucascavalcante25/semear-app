import { Icon } from "@iconify/react";
import { ImageIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="h-9 w-9 shrink-0 text-[#25D366] hover:text-[#25D366] hover:bg-[#25D366]/10"
        disabled={!!carregando}
        aria-label="Compartilhar no WhatsApp"
        title="WhatsApp"
        onClick={() => void noWhatsApp()}
      >
        {carregando === "whatsapp" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Icon icon="mdi:whatsapp" className="h-5 w-5" />
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-9 w-9 shrink-0 text-[#E1306C] hover:text-[#E1306C] hover:bg-[#E1306C]/10"
            disabled={!!carregando}
            aria-label="Compartilhar no Instagram"
            title="Instagram"
          >
            {carregando === "stories" || carregando === "feed" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Icon icon="mdi:instagram" className="h-5 w-5" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Instagram</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            disabled={!!carregando}
            onSelect={() => void noStories()}
          >
            <ImageIcon className="h-4 w-4" />
            Stories / Status
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            disabled={!!carregando}
            onSelect={() => void noFeed()}
          >
            <Icon icon="mdi:instagram" className="h-4 w-4" />
            Feed da igreja
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
