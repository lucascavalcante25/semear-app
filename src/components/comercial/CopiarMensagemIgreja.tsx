import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { obterMensagensComerciaisAdmin, type AssinaturaIgreja } from "@/modules/admin/api";
import {
  MENSAGENS_PADRAO,
  copiarTexto,
  mensagemParaIgreja,
  type MensagensComerciais,
} from "@/lib/mensagens-comerciais";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  assinatura: AssinaturaIgreja;
};

const ROTULOS: { chave: keyof MensagensComerciais; label: string }[] = [
  { chave: "mensagemAbordagem", label: "Primeira abordagem" },
  { chave: "mensagemPreco", label: "Envio de preço" },
  { chave: "mensagemDemo", label: "Demonstração" },
  { chave: "mensagemFimTeste", label: "Fim de teste" },
];

export function CopiarMensagemIgreja({ assinatura }: Props) {
  const [carregando, setCarregando] = useState(false);

  const copiar = async (chave: keyof MensagensComerciais) => {
    setCarregando(true);
    try {
      const remoto = await obterMensagensComerciaisAdmin().catch(() => ({}));
      const mensagens = { ...MENSAGENS_PADRAO, ...remoto };
      const template = mensagens[chave] ?? MENSAGENS_PADRAO[chave] ?? "";
      const texto = mensagemParaIgreja(template, {
        responsavelNome: assinatura.responsavelNome,
        igrejaNome: assinatura.igrejaNome,
        diasRestantesTeste: assinatura.diasRestantesTeste,
        valorMensalContratado: assinatura.valorMensalContratado ?? assinatura.valorMensal,
        valorImplantacaoContratado: assinatura.valorImplantacaoContratado,
        valorAnualContratado: assinatura.valorAnualContratado,
      });
      await copiarTexto(texto);
      toast.success("Mensagem copiada com dados da igreja!");
    } catch {
      toast.error("Não foi possível copiar a mensagem.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1" disabled={carregando}>
          {carregando ? <Loader2 className="h-3 w-3 animate-spin" /> : <Copy className="h-3 w-3" />}
          Copiar msg.
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {ROTULOS.map(({ chave, label }) => (
          <DropdownMenuItem key={chave} onClick={() => void copiar(chave)}>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
