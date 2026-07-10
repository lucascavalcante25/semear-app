import { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutApp } from "@/components/layout";
import { ConfigNotificacaoForm } from "@/components/notificacoes/ConfigNotificacaoForm";
import { configNotificacaoPadrao } from "@/modules/notificacoes/config-types";
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
  Loader2,
  Bell,
  Globe,
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
import { usarNotificacoes } from "@/contexts/NotificationsContext";
import { canWrite } from "@/auth/permissions";
import {
  criarComunicado,
  excluirComunicado,
  listarComunicados,
  obterComunicado,
  atualizarComunicado,
  dtoFromApp,
  LABEL_PUBLICO,
  type ComunicadoApp,
  type PublicoAlvoComunicadoApi,
} from "@/modules/comunicados/api";
import { comunicadoEstaVigente, filtrarComunicadosVigentes } from "@/lib/comunicado-vigencia";
import { DatePicker } from "@/components/ui/date-picker";

const typeConfig: Record<
  ComunicadoApp["type"],
  { icon: typeof Megaphone; label: string; badgeClass: string; cardClass: string }
> = {
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
  campanha: {
    icon: Megaphone,
    label: "Campanha",
    badgeClass: "bg-gold/10 text-gold-dark border-gold/20",
    cardClass: "border-gold/30 bg-gold/5",
  },
  boas_vindas: {
    icon: Bell,
    label: "Boas-vindas",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    cardClass: "border-primary/20 bg-primary/5",
  },
  sistema: {
    icon: Bell,
    label: "Sistema",
    badgeClass: "bg-muted text-muted-foreground border-border",
    cardClass: "",
  },
  normal: {
    icon: Megaphone,
    label: "Normal",
    badgeClass: "bg-muted text-muted-foreground border-border",
    cardClass: "",
  },
};

function CartaoComunicado({
  item,
  aoEditar,
  aoExcluir,
  podeEditar,
}: {
  item: ComunicadoApp;
  aoEditar: (item: ComunicadoApp) => void;
  aoExcluir: (item: ComunicadoApp) => void;
  podeEditar: boolean;
}) {
  const config = typeConfig[item.type];
  const Icon = config.icon;

  return (
    <Card className={cn("transition-shadow hover:shadow-md", config.cardClass)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              item.type === "urgent"
                ? "bg-destructive/10 text-destructive"
                : item.type === "fixed"
                  ? "bg-olive/10 text-olive"
                  : "bg-muted text-muted-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-semibold">{item.title}</h3>
              <Badge variant="outline" className={cn("text-xs", config.badgeClass)}>
                {config.label}
              </Badge>
              {item.exibirNoLogin && (
                <Badge variant="secondary" className="text-[10px]">
                  Login
                </Badge>
              )}
              {item.exibirNoSitePublico && (
                <Badge variant="outline" className="text-[10px] gap-1">
                  <Globe className="h-3 w-3" />
                  Site
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-2">{item.content}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {item.startDate.toLocaleDateString("pt-BR")}
                {item.endDate && <> até {item.endDate.toLocaleDateString("pt-BR")}</>}
              </span>
              <span>Por: {item.createdBy}</span>
            </div>
          </div>

          {podeEditar && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => aoEditar(item)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => aoExcluir(item)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const comunicadoVazio = (): Omit<ComunicadoApp, "id" | "idNum" | "createdAt" | "createdBy"> => ({
  title: "",
  content: "",
  type: "normal",
  publicoAlvo: "TODOS",
  prioridade: "NORMAL",
  exibirNoLogin: false,
  obrigatorio: false,
  exibirNoSitePublico: true,
  startDate: new Date(),
  isActive: true,
  configNotificacao: configNotificacaoPadrao(),
});

export default function Comunicados() {
  const { user } = usarAutenticacao();
  const { refreshNotificacoes } = usarNotificacoes();
  const podeEscrever = canWrite(user, "/comunicados");
  const [buscaTexto, setBuscaTexto] = useState("");
  const [lista, setLista] = useState<ComunicadoApp[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [emEdicao, setEmEdicao] = useState<ComunicadoApp | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState<ComunicadoApp | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [form, setForm] = useState(comunicadoVazio());

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const dados = await listarComunicados(true, 100);
      setLista(dados);
    } catch (err) {
      setLista([]);
      toast.error(err instanceof Error ? err.message : "Erro ao carregar comunicados.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const filtrados = useMemo(
    () =>
      lista.filter(
        (c) =>
          c.title.toLowerCase().includes(buscaTexto.toLowerCase()) ||
          c.content.toLowerCase().includes(buscaTexto.toLowerCase()),
      ),
    [lista, buscaTexto],
  );

  const vigentes = useMemo(() => filtrarComunicadosVigentes(filtrados), [filtrados]);
  const foraDoPeriodo = useMemo(() => filtrados.filter((c) => !comunicadoEstaVigente(c)), [filtrados]);

  const fixos = vigentes.filter((c) => c.type === "fixed");
  const urgentes = vigentes.filter((c) => c.type === "urgent");
  const outros = vigentes.filter((c) => c.type !== "fixed" && c.type !== "urgent");

  const abrirNovo = () => {
    setEmEdicao(null);
    setForm(comunicadoVazio());
    setDialogAberto(true);
  };

  const editar = async (item: ComunicadoApp) => {
    try {
      const completo = item.idNum != null ? await obterComunicado(item.idNum) : item;
      setEmEdicao(completo);
      setForm({
        title: completo.title,
        content: completo.content,
        type: completo.type,
        publicoAlvo: completo.publicoAlvo,
        prioridade: completo.prioridade,
        exibirNoLogin: completo.exibirNoLogin,
        obrigatorio: completo.obrigatorio,
        exibirNoSitePublico: completo.exibirNoSitePublico,
        startDate: completo.startDate,
        endDate: completo.endDate,
        isActive: completo.isActive,
        ctaRotulo: completo.ctaRotulo,
        ctaRota: completo.ctaRota,
        configNotificacao: completo.configNotificacao ?? configNotificacaoPadrao(),
      });
      setDialogAberto(true);
    } catch {
      toast.error("Não foi possível carregar o comunicado para edição.");
    }
  };

  const salvar = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Título e conteúdo são obrigatórios.");
      return;
    }
    setSalvando(true);
    try {
      const dto = dtoFromApp({ ...form, idNum: emEdicao?.idNum });
      if (!emEdicao) {
        const criado = await criarComunicado(dto);
        setLista((prev) => [criado, ...prev]);
        toast.success("Comunicado criado.");
      } else {
        const atualizado = await atualizarComunicado(dto);
        setLista((prev) =>
          prev.map((c) => (c.idNum === atualizado.idNum || c.id === atualizado.id ? atualizado : c)),
        );
        toast.success("Comunicado atualizado.");
      }
      setDialogAberto(false);
      await refreshNotificacoes();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExcluir = async (item: ComunicadoApp) => {
    const id = item.idNum ?? Number(item.id);
    if (!id || Number.isNaN(id)) {
      toast.error("Não foi possível identificar o comunicado para exclusão.");
      return;
    }
    setExcluindo(true);
    try {
      await excluirComunicado(id);
      toast.success("Comunicado excluído.");
      setConfirmarExclusao(null);
      setLista((prev) => prev.filter((c) => c.idNum !== id && Number(c.id) !== id));
      await refreshNotificacoes();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir.");
    } finally {
      setExcluindo(false);
    }
  };

  const renderSecao = (titulo: string, items: ComunicadoApp[], icone?: React.ReactNode) =>
    items.length > 0 ? (
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 text-muted-foreground">
          {icone}
          {titulo}
        </h2>
        <div className="space-y-3">
          {items.map((c) => (
            <CartaoComunicado
              key={c.id}
              item={c}
              aoEditar={editar}
              aoExcluir={setConfirmarExclusao}
              podeEditar={podeEscrever}
            />
          ))}
        </div>
      </section>
    ) : null;

  return (
    <LayoutApp>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold text-gold-foreground">
              <Megaphone className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Comunicados</h1>
              <p className="text-sm text-muted-foreground">
                {vigentes.length} em exibição hoje
                {foraDoPeriodo.length > 0 && ` · ${foraDoPeriodo.length} fora do período`}
              </p>
            </div>
          </div>

          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={abrirNovo} disabled={!podeEscrever}>
                <Plus className="h-4 w-4" />
                Novo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{emEdicao ? "Editar comunicado" : "Novo comunicado"}</DialogTitle>
                <DialogDescription>
                  Mensagens para a igreja no app, no login e no site público.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Título *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Conteúdo *</Label>
                  <Textarea
                    rows={4}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={form.type}
                      onValueChange={(v) => setForm({ ...form, type: v as ComunicadoApp["type"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="fixed">Fixo</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                        <SelectItem value="campanha">Campanha</SelectItem>
                        <SelectItem value="boas_vindas">Boas-vindas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Público-alvo</Label>
                    <Select
                      value={form.publicoAlvo}
                      onValueChange={(v) =>
                        setForm({ ...form, publicoAlvo: v as PublicoAlvoComunicadoApi })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(LABEL_PUBLICO) as PublicoAlvoComunicadoApi[]).map((p) => (
                          <SelectItem key={p} value={p}>
                            {LABEL_PUBLICO[p]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data início</Label>
                    <DatePicker
                      value={form.startDate.toISOString().slice(0, 10)}
                      onChange={(v) =>
                        setForm({ ...form, startDate: new Date(`${v ?? form.startDate.toISOString().slice(0, 10)}T00:00:00`) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data fim (opcional)</Label>
                    <DatePicker
                      value={form.endDate?.toISOString().slice(0, 10) ?? ""}
                      onChange={(v) =>
                        setForm({
                          ...form,
                          endDate: v ? new Date(`${v}T00:00:00`) : undefined,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="rounded-lg border p-3 space-y-3">
                  <p className="text-sm font-medium">Onde exibir</p>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="exibir-login">Exibir ao entrar no sistema</Label>
                    <Switch
                      id="exibir-login"
                      checked={form.exibirNoLogin}
                      onCheckedChange={(v) => setForm({ ...form, exibirNoLogin: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="obrigatorio">Obrigatório (não pode fechar sem confirmar)</Label>
                    <Switch
                      id="obrigatorio"
                      checked={form.obrigatorio}
                      onCheckedChange={(v) => setForm({ ...form, obrigatorio: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="exibir-site">Exibir no site público da igreja</Label>
                    <Switch
                      id="exibir-site"
                      checked={form.exibirNoSitePublico}
                      onCheckedChange={(v) => setForm({ ...form, exibirNoSitePublico: v })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="ativo">Ativo</Label>
                  <Switch
                    id="ativo"
                    checked={form.isActive}
                    onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                  />
                </div>

                <ConfigNotificacaoForm
                  modo="comunicado"
                  value={form.configNotificacao ?? configNotificacaoPadrao()}
                  onChange={(configNotificacao) => setForm({ ...form, configNotificacao })}
                />

                <div className="flex justify-end gap-2 pt-2">
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

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar comunicados..."
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
            {renderSecao("Fixos", fixos, <Pin className="h-4 w-4 text-olive" />)}
            {renderSecao("Urgentes", urgentes, <AlertTriangle className="h-4 w-4 text-destructive" />)}
            {renderSecao("Outros", outros)}
            {vigentes.length === 0 && foraDoPeriodo.length === 0 && (
              <div className="text-center py-12">
                <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum comunicado encontrado</p>
              </div>
            )}
            {podeEscrever && foraDoPeriodo.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Fora do período
                </h2>
                <div className="space-y-3 opacity-75">
                  {foraDoPeriodo.map((c) => (
                    <CartaoComunicado
                      key={c.id}
                      item={c}
                      aoEditar={editar}
                      aoExcluir={setConfirmarExclusao}
                      podeEditar={podeEscrever}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <AlertDialog open={!!confirmarExclusao} onOpenChange={(v) => !v && setConfirmarExclusao(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir comunicado</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{confirmarExclusao?.title}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={excluindo}
              onClick={(e) => {
                e.preventDefault();
                if (confirmarExclusao) {
                  void confirmarExcluir(confirmarExclusao);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {excluindo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </LayoutApp>
  );
}
