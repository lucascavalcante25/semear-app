import { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Megaphone, 
  Search, 
  Plus,
  Pin,
  AlertTriangle,
  Calendar,
  Edit,
  Trash2,
  MoreVertical,
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
import { usarAutenticacao } from "@/contexts/AuthContext";
import {
  criarAviso,
  excluirAviso as apiExcluirAviso,
  listarAvisos,
  atualizarAviso as apiAtualizarAviso,
  tipoUiParaApi,
  type AvisoApp,
  type AvisoDTO,
} from "@/modules/announcements/api";
import { DatePicker } from "@/components/ui/date-picker";

const typeConfig = {
  fixed: {
    icon: Pin,
    label: "Fixo",
    badgeClass: "bg-olive/10 text-olive border-olive/20",
    cardClass: "border-olive/30 bg-olive/5",
  },
  urgent: {
    icon: AlertTriangle,
    label: "Urgente",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
    cardClass: "border-destructive/30 bg-destructive/5",
  },
  normal: {
    icon: Megaphone,
    label: "Normal",
    badgeClass: "bg-muted text-muted-foreground border-border",
    cardClass: "",
  },
};

interface CartaoAvisoProps {
  aviso: AvisoApp;
  aoEditar: (aviso: AvisoApp) => void;
  aoExcluir: (aviso: AvisoApp) => void;
}

function CartaoAviso({ aviso, aoEditar, aoExcluir }: CartaoAvisoProps) {
  const config = typeConfig[aviso.type];
  const Icon = config.icon;

  return (
    <Card className={cn("transition-shadow hover:shadow-md", config.cardClass)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            aviso.type === "urgent" ? "bg-destructive/10 text-destructive" :
            aviso.type === "fixed" ? "bg-olive/10 text-olive" :
            "bg-muted text-muted-foreground"
          )}>
            <Icon className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{aviso.title}</h3>
              <Badge variant="outline" className={cn("text-xs", config.badgeClass)}>
                {config.label}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              {aviso.content}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {aviso.startDate.toLocaleDateString("pt-BR")}
                {aviso.endDate && (
                  <> até {aviso.endDate.toLocaleDateString("pt-BR")}</>
                )}
              </span>
              <span>Por: {aviso.createdBy}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => aoEditar(aviso)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => aoExcluir(aviso)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaginaAvisos() {
  const { user } = usarAutenticacao();
  const [buscaTexto, setBuscaTexto] = useState("");
  const [avisos, setAvisos] = useState<AvisoApp[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [avisoEmEdicao, setAvisoEmEdicao] = useState<AvisoApp | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState<AvisoApp | null>(null);

  const [formTitulo, setFormTitulo] = useState("");
  const [formConteudo, setFormConteudo] = useState("");
  const [formTipo, setFormTipo] = useState<AvisoApp["type"]>("normal");
  const [formInicio, setFormInicio] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [formFim, setFormFim] = useState<string>("");
  const [formAtivo, setFormAtivo] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const lista = await listarAvisos(true, 500);
      setAvisos(lista);
    } catch (err) {
      setAvisos([]);
      toast.error(err instanceof Error ? err.message : "Erro ao carregar avisos.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const avisosFiltrados = useMemo(
    () =>
      avisos.filter(
        (a) =>
          a.title.toLowerCase().includes(buscaTexto.toLowerCase()) ||
          a.content.toLowerCase().includes(buscaTexto.toLowerCase()),
      ),
    [avisos, buscaTexto],
  );

  const avisosFixos = avisosFiltrados.filter((a) => a.type === "fixed");
  const avisosUrgentes = avisosFiltrados.filter((a) => a.type === "urgent");
  const avisosNormais = avisosFiltrados.filter((a) => a.type === "normal");

  const abrirNovo = () => {
    setAvisoEmEdicao(null);
    setFormTitulo("");
    setFormConteudo("");
    setFormTipo("normal");
    setFormInicio(new Date().toISOString().slice(0, 10));
    setFormFim("");
    setFormAtivo(true);
    setDialogAberto(true);
  };

  const editarAviso = (aviso: AvisoApp) => {
    setAvisoEmEdicao(aviso);
    setFormTitulo(aviso.title);
    setFormConteudo(aviso.content);
    setFormTipo(aviso.type);
    setFormInicio(aviso.startDate.toISOString().slice(0, 10));
    setFormFim(aviso.endDate ? aviso.endDate.toISOString().slice(0, 10) : "");
    setFormAtivo(aviso.isActive);
    setDialogAberto(true);
  };

  const excluirAviso = (aviso: AvisoApp) => setConfirmarExclusao(aviso);

  const salvar = async () => {
    if (!formTitulo.trim() || !formConteudo.trim()) {
      toast.error("Título e conteúdo são obrigatórios.");
      return;
    }
    setSalvando(true);
    try {
      if (!avisoEmEdicao) {
        await criarAviso({
          title: formTitulo,
          content: formConteudo,
          type: formTipo,
          startDate: new Date(`${formInicio}T00:00:00`),
          endDate: formFim ? new Date(`${formFim}T00:00:00`) : undefined,
          isActive: formAtivo,
        });
        toast.success("Aviso criado.");
      } else if (avisoEmEdicao.idNum) {
        const dto: AvisoDTO = {
          id: avisoEmEdicao.idNum,
          titulo: formTitulo.trim(),
          conteudo: formConteudo.trim(),
          tipo: tipoUiParaApi(formTipo),
          dataInicio: formInicio,
          dataFim: formFim || null,
          ativo: formAtivo,
        };
        await apiAtualizarAviso(dto);
        toast.success("Aviso atualizado.");
      }
      setDialogAberto(false);
      await carregar();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar aviso.");
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExcluir = async () => {
    if (!confirmarExclusao?.idNum) return;
    try {
      await apiExcluirAviso(confirmarExclusao.idNum);
      toast.success("Aviso excluído.");
      setConfirmarExclusao(null);
      await carregar();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir aviso.");
    }
  };

  return (
    <LayoutApp>
      <div className="space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold text-gold-foreground">
              <Megaphone className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Avisos</h1>
              <p className="text-sm text-muted-foreground">
                {avisos.length} avisos ativos
              </p>
            </div>
          </div>

          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={abrirNovo} disabled={user?.role !== "admin"}>
                <Plus className="h-4 w-4" />
                Novo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{avisoEmEdicao ? "Editar Aviso" : "Novo Aviso"}</DialogTitle>
                <DialogDescription>
                  {avisoEmEdicao ? "Atualize o aviso." : "Crie um novo aviso para a igreja."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    placeholder="Título do aviso"
                    value={formTitulo}
                    onChange={(e) => setFormTitulo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo *</Label>
                  <Textarea
                    id="content"
                    placeholder="Escreva o aviso..."
                    rows={4}
                    value={formConteudo}
                    onChange={(e) => setFormConteudo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formTipo} onValueChange={(v) => setFormTipo(v as AvisoApp["type"])}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Tipo de aviso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="fixed">Fixo</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data início</Label>
                    <DatePicker
                      id="startDate"
                      value={formInicio}
                      onChange={setFormInicio}
                      placeholder="Selecione a data"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data fim (opcional)</Label>
                    <DatePicker
                      id="endDate"
                      value={formFim}
                      onChange={setFormFim}
                      placeholder="Selecione a data"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Ativo</Label>
                  <Switch id="active" checked={formAtivo} onCheckedChange={setFormAtivo} />
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
            placeholder="Buscar avisos..."
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
        {/* Avisos fixos */}
        {avisosFixos.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-olive uppercase tracking-wider mb-3 flex items-center gap-2">
              <Pin className="h-4 w-4" />
              Avisos Fixos
            </h2>
            <div className="space-y-3">
              {avisosFixos.map((a) => (
                <CartaoAviso
                  key={a.id}
                  aviso={a}
                  aoEditar={editarAviso}
                  aoExcluir={excluirAviso}
                />
              ))}
            </div>
          </section>
        )}

        {/* Avisos urgentes */}
        {avisosUrgentes.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-destructive uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Avisos Urgentes
            </h2>
            <div className="space-y-3">
              {avisosUrgentes.map((a) => (
                <CartaoAviso
                  key={a.id}
                  aviso={a}
                  aoEditar={editarAviso}
                  aoExcluir={excluirAviso}
                />
              ))}
            </div>
          </section>
        )}

        {/* Avisos normais */}
        {avisosNormais.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Outros Avisos
            </h2>
            <div className="space-y-3">
              {avisosNormais.map((a) => (
                <CartaoAviso
                  key={a.id}
                  aviso={a}
                  aoEditar={editarAviso}
                  aoExcluir={excluirAviso}
                />
              ))}
            </div>
          </section>
        )}

        {avisosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Nenhum aviso encontrado
            </p>
          </div>
        )}
        </>
        )}
      </div>

      <AlertDialog open={!!confirmarExclusao} onOpenChange={(v) => { if (!v) setConfirmarExclusao(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir aviso</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{confirmarExclusao?.title}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExcluir}
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
