import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { usarEhMobile } from "@/hooks/use-mobile";
import type { LouvorApp } from "@/modules/louvores/api";

type Props = {
  aberto: boolean;
  onFechar: () => void;
  louvores: LouvorApp[];
  idsJaNoCulto: number[];
  carregando?: boolean;
  onConfirmar: (selecionados: LouvorApp[]) => void;
};

function CorpoSelecao({
  busca,
  onBusca,
  filtrados,
  disponiveis,
  marcados,
  onToggle,
  carregando,
}: {
  busca: string;
  onBusca: (valor: string) => void;
  filtrados: LouvorApp[];
  disponiveis: LouvorApp[];
  marcados: Set<number>;
  onToggle: (id: number) => void;
  carregando: boolean;
}) {
  return (
    <>
      <div className="shrink-0 border-b px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar louvor…"
            className="pl-10"
            value={busca}
            onChange={(e) => onBusca(e.target.value)}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
        {carregando ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtrados.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {disponiveis.length === 0
              ? "Todos os louvores do repertório já estão neste culto."
              : "Nenhum louvor encontrado."}
          </p>
        ) : (
          <ul className="space-y-1 pb-2">
            {filtrados.map((louvor) => {
              const id = louvor.idNum!;
              const marcado = marcados.has(id);
              return (
                <li key={id}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40 has-[:checked]:border-primary/40 has-[:checked]:bg-primary/5">
                    <Checkbox
                      checked={marcado}
                      onCheckedChange={() => onToggle(id)}
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-medium leading-snug">{louvor.title}</p>
                      {louvor.artist && (
                        <p className="mt-0.5 break-words text-xs text-muted-foreground">{louvor.artist}</p>
                      )}
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

export function ModalSelecionarLouvoresRepertorio({
  aberto,
  onFechar,
  louvores,
  idsJaNoCulto,
  carregando = false,
  onConfirmar,
}: Props) {
  const isMobile = usarEhMobile();
  const [busca, setBusca] = useState("");
  const [marcados, setMarcados] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!aberto) {
      setBusca("");
      setMarcados(new Set());
    }
  }, [aberto]);

  const disponiveis = useMemo(
    () => louvores.filter((l) => l.idNum != null && !idsJaNoCulto.includes(l.idNum)),
    [louvores, idsJaNoCulto],
  );

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return disponiveis;
    return disponiveis.filter(
      (l) =>
        l.title.toLowerCase().includes(termo) ||
        l.artist?.toLowerCase().includes(termo),
    );
  }, [busca, disponiveis]);

  const toggle = (id: number) => {
    setMarcados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirmar = () => {
    const selecionados = disponiveis.filter((l) => l.idNum != null && marcados.has(l.idNum));
    if (selecionados.length === 0) return;
    onConfirmar(selecionados);
    onFechar();
  };

  const rodape = (
    <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onFechar}>
        Cancelar
      </Button>
      <Button type="button" className="w-full sm:w-auto" disabled={marcados.size === 0} onClick={confirmar}>
        Adicionar {marcados.size > 0 ? `(${marcados.size})` : ""}
      </Button>
    </div>
  );

  const corpo = (
    <CorpoSelecao
      busca={busca}
      onBusca={setBusca}
      filtrados={filtrados}
      disponiveis={disponiveis}
      marcados={marcados}
      onToggle={toggle}
      carregando={carregando}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={aberto} onOpenChange={(open) => !open && onFechar()}>
        <DrawerContent stackLayer="top" className="flex max-h-[92dvh] flex-col">
          <DrawerHeader className="shrink-0 border-b text-left">
            <DrawerTitle>Selecionar do repertório</DrawerTitle>
            <DrawerDescription>
              Marque uma ou mais músicas para adicionar só a este culto.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{corpo}</div>
          <DrawerFooter className="shrink-0 border-t">{rodape}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={aberto} onOpenChange={(open) => !open && onFechar()}>
      <DialogContent stackLayer="top" className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b px-4 py-4 pr-12 text-left">
          <DialogTitle>Selecionar do repertório</DialogTitle>
          <DialogDescription>
            Marque uma ou mais músicas para adicionar só a este culto.
          </DialogDescription>
        </DialogHeader>
        {corpo}
        <DialogFooter className="shrink-0 gap-2 border-t px-4 py-3 sm:justify-end">{rodape}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
