import { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  UserPlus, 
  Search, 
  Plus,
  Calendar,
  MessageSquare,
  MoreVertical,
  Edit,
  Trash2,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  atualizarVisitante,
  criarVisitante,
  excluirVisitante,
  listarVisitantes,
  type VisitanteApp,
  type VisitanteDTO,
} from "@/modules/visitors/api";
import { DatePicker } from "@/components/ui/date-picker";

function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isThisWeek(date: Date): boolean {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  return date >= weekAgo && date <= today;
}

interface CartaoVisitanteProps {
  visitante: VisitanteApp;
  aoEditar: (visitante: VisitanteApp) => void;
  aoExcluir: (visitante: VisitanteApp) => void;
}

function CartaoVisitante({ visitante, aoEditar, aoExcluir }: CartaoVisitanteProps) {
  const visitaHoje = isToday(visitante.visitDate);

  return (
    <Card className={cn(
      "transition-shadow hover:shadow-md",
      visitaHoje && "border-gold bg-gold/5"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold",
            visitaHoje 
              ? "bg-gold text-gold-foreground" 
              : "bg-deep-blue/10 text-deep-blue"
          )}>
            {visitante.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="font-semibold truncate">{visitante.name}</h3>
                {visitaHoje && (
                  <Badge className="bg-gold text-gold-foreground border-0">
                    Hoje!
                  </Badge>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => aoEditar(visitante)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => aoExcluir(visitante)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {visitante.visitDate.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
              
              {visitante.howHeard && (
                <p className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {visitante.howHeard}
                </p>
              )}
            </div>

            {visitante.notes && (
              <p className="mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                {visitante.notes}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Visitantes() {
  const [buscaTexto, setBuscaTexto] = useState("");
  const [visitantes, setVisitantes] = useState<VisitanteApp[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [visitanteEmEdicao, setVisitanteEmEdicao] = useState<VisitanteApp | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState<VisitanteApp | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [formNome, setFormNome] = useState("");
  const [formComoConheceu, setFormComoConheceu] = useState("");
  const [formObservacoes, setFormObservacoes] = useState("");
  const [formDataVisita, setFormDataVisita] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const lista = await listarVisitantes();
      setVisitantes(lista);
    } catch (err) {
      setVisitantes([]);
      toast.error(err instanceof Error ? err.message : "Erro ao carregar visitantes.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const abrirNovo = () => {
    setVisitanteEmEdicao(null);
    setFormNome("");
    setFormComoConheceu("");
    setFormObservacoes("");
    setFormDataVisita(new Date().toISOString().slice(0, 10));
    setDialogAberto(true);
  };

  const abrirEditar = (v: VisitanteApp) => {
    setVisitanteEmEdicao(v);
    setFormNome(v.name);
    setFormComoConheceu(v.howHeard ?? "");
    setFormObservacoes(v.notes ?? "");
    setFormDataVisita(v.visitDate.toISOString().slice(0, 10));
    setDialogAberto(true);
  };

  const solicitarExcluir = (v: VisitanteApp) => setConfirmarExclusao(v);

  const salvar = async () => {
    if (!formNome.trim()) {
      toast.error("Nome é obrigatório.");
      return;
    }
    if (!formDataVisita) {
      toast.error("Data da visita é obrigatória.");
      return;
    }
    setSalvando(true);
    try {
      if (!visitanteEmEdicao) {
        await criarVisitante({
          nome: formNome,
          comoConheceu: formComoConheceu,
          observacoes: formObservacoes,
          dataVisita: formDataVisita,
        });
        toast.success("Visitante cadastrado.");
      } else {
        const dto: VisitanteDTO = {
          id: Number(visitanteEmEdicao.id),
          nome: formNome.trim(),
          telefone: null,
          dataVisita: formDataVisita,
          comoConheceu: formComoConheceu.trim() || null,
          observacoes: formObservacoes.trim() || null,
        };
        await atualizarVisitante(dto);
        toast.success("Visitante atualizado.");
      }
      setDialogAberto(false);
      await carregar();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar visitante.");
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExcluirVisitante = async () => {
    if (!confirmarExclusao) return;
    try {
      await excluirVisitante(Number(confirmarExclusao.id));
      toast.success("Visitante excluído.");
      setConfirmarExclusao(null);
      await carregar();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir visitante.");
    }
  };

  const visitantesFiltrados = useMemo(
    () =>
      visitantes.filter((visitante) =>
        visitante.name.toLowerCase().includes(buscaTexto.toLowerCase()),
      ),
    [visitantes, buscaTexto],
  );

  const visitantesHoje = visitantesFiltrados.filter((v) => isToday(v.visitDate));
  const visitantesSemana = visitantesFiltrados.filter((v) => isThisWeek(v.visitDate) && !isToday(v.visitDate));
  const visitantesAnteriores = visitantesFiltrados.filter((v) => !isThisWeek(v.visitDate));

  return (
    <LayoutApp>
      <div className="space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-deep-blue text-deep-blue-foreground">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Visitantes</h1>
              <p className="text-sm text-muted-foreground">
                {visitantes.length} visitantes registrados
              </p>
            </div>
          </div>

          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={abrirNovo}>
                <Plus className="h-4 w-4" />
                Novo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{visitanteEmEdicao ? "Editar Visitante" : "Novo Visitante"}</DialogTitle>
                <DialogDescription>
                  {visitanteEmEdicao ? "Atualize os dados do visitante." : "Registre um novo visitante."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    placeholder="Nome do visitante"
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visitDate">Data da visita *</Label>
                  <DatePicker
                    id="visitDate"
                    value={formDataVisita}
                    onChange={setFormDataVisita}
                    placeholder="Selecione a data"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="howHeard">Como conheceu a igreja?</Label>
                  <Input
                    id="howHeard"
                    placeholder="Ex: Indicação de amigo"
                    value={formComoConheceu}
                    onChange={(e) => setFormComoConheceu(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Alguma observação..."
                    value={formObservacoes}
                    onChange={(e) => setFormObservacoes(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogAberto(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={salvar} disabled={salvando}>
                    {salvando && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Salvar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar visitante..."
            className="pl-10"
            value={buscaTexto}
            onChange={(e) => setBuscaTexto(e.target.value)}
          />
        </div>

        {carregando ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
        <>
        {/* Visitantes de hoje */}
        {visitantesHoje.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gold-dark uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
              Visitantes de Hoje ({visitantesHoje.length})
            </h2>
            <div className="space-y-3">
              {visitantesHoje.map((visitante) => (
                <CartaoVisitante
                  key={visitante.id}
                  visitante={visitante}
                  aoEditar={abrirEditar}
                  aoExcluir={solicitarExcluir}
                />
              ))}
            </div>
          </section>
        )}

        {/* Visitantes da semana */}
        {visitantesSemana.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Esta Semana ({visitantesSemana.length})
            </h2>
            <div className="space-y-3">
              {visitantesSemana.map((visitante) => (
                <CartaoVisitante
                  key={visitante.id}
                  visitante={visitante}
                  aoEditar={abrirEditar}
                  aoExcluir={solicitarExcluir}
                />
              ))}
            </div>
          </section>
        )}

        {/* Visitantes anteriores */}
        {visitantesAnteriores.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Anteriores ({visitantesAnteriores.length})
            </h2>
            <div className="space-y-3">
              {visitantesAnteriores.map((visitante) => (
                <CartaoVisitante
                  key={visitante.id}
                  visitante={visitante}
                  aoEditar={abrirEditar}
                  aoExcluir={solicitarExcluir}
                />
              ))}
            </div>
          </section>
        )}

        {visitantesFiltrados.length === 0 && (
          <div className="text-center py-12">
            <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Nenhum visitante encontrado
            </p>
          </div>
        )}
        </>
        )}
      </div>

      <AlertDialog open={!!confirmarExclusao} onOpenChange={(v) => { if (!v) setConfirmarExclusao(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir visitante</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{confirmarExclusao?.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExcluirVisitante}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </LayoutApp>
  );
}
