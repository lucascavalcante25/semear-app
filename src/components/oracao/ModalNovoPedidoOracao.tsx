import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  criarPedidoOracao,
  LABEL_CATEGORIA,
  LABEL_VISIBILIDADE,
  type CategoriaPedidoOracaoApi,
  type PedidoOracaoDTO,
  type VisibilidadePedidoOracaoApi,
} from "@/modules/oracao/api";

const CATEGORIAS = Object.keys(LABEL_CATEGORIA) as CategoriaPedidoOracaoApi[];

type Props = {
  aberto: boolean;
  onAbertoChange: (aberto: boolean) => void;
  onCriado?: (pedido: PedidoOracaoDTO) => void;
};

export function ModalNovoPedidoOracao({ aberto, onAbertoChange, onCriado }: Props) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<CategoriaPedidoOracaoApi>("OUTRO");
  const [visibilidade, setVisibilidade] = useState<VisibilidadePedidoOracaoApi>("PUBLICA");
  const [anonimo, setAnonimo] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const limpar = () => {
    setTitulo("");
    setDescricao("");
    setCategoria("OUTRO");
    setVisibilidade("PUBLICA");
    setAnonimo(false);
  };

  const enviar = async () => {
    if (!titulo.trim()) {
      toast.error("Informe um título curto para o pedido.");
      return;
    }
    if (!descricao.trim()) {
      toast.error("Descreva como podemos orar por você.");
      return;
    }
    setEnviando(true);
    try {
      const criado = await criarPedidoOracao({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        categoria,
        visibilidade,
        anonimo,
      });
      toast.success("Obrigado. Seu pedido foi enviado.");
      limpar();
      onAbertoChange(false);
      onCriado?.(criado);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível enviar o pedido.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onAbertoChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Como podemos orar por você?</DialogTitle>
          <DialogDescription>
            Compartilhe sua necessidade com carinho. Evite dados muito sensíveis (endereço, documentos).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="titulo-oracao">Título</Label>
            <Input
              id="titulo-oracao"
              placeholder="Ex.: Cura para minha mãe"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={80}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao-oracao">Descrição</Label>
            <Textarea
              id="descricao-oracao"
              placeholder="Conte brevemente como podemos interceder..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={categoria} onValueChange={(v) => setCategoria(v as CategoriaPedidoOracaoApi)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {LABEL_CATEGORIA[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quem pode ver?</Label>
            <Select
              value={visibilidade}
              onValueChange={(v) => setVisibilidade(v as VisibilidadePedidoOracaoApi)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLICA">{LABEL_VISIBILIDADE.PUBLICA}</SelectItem>
                <SelectItem value="PRIVADA">{LABEL_VISIBILIDADE.PRIVADA}</SelectItem>
              </SelectContent>
            </Select>
            {visibilidade === "PRIVADA" && (
              <p className="text-xs text-muted-foreground">
                Seu pedido será visto apenas pela liderança.
              </p>
            )}
            {visibilidade === "PUBLICA" && (
              <p className="text-xs text-muted-foreground">
                Pode aguardar aprovação da liderança antes de aparecer no mural.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Não mostrar meu nome</p>
              <p className="text-xs text-muted-foreground">Publicar como pedido anônimo</p>
            </div>
            <Switch checked={anonimo} onCheckedChange={setAnonimo} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onAbertoChange(false)} disabled={enviando}>
            Cancelar
          </Button>
          <Button onClick={() => void enviar()} disabled={enviando}>
            {enviando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
