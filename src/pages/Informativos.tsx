import { useCallback, useEffect, useState } from "react";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Bell, Eye, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { canWrite } from "@/auth/permissions";
import { DatePicker } from "@/components/ui/date-picker";
import {
  atualizarInformativo,
  criarInformativo,
  excluirInformativo,
  LABEL_PUBLICO,
  LABEL_TIPO,
  listarInformativosAdmin,
  listarLeiturasInformativo,
  type InformativoDTO,
  type InformativoLeituraDTO,
  type PublicoAlvoInformativoApi,
  type TipoInformativoApi,
} from "@/modules/informativos/api";

const TIPOS = Object.keys(LABEL_TIPO) as TipoInformativoApi[];
const PUBLICOS = Object.keys(LABEL_PUBLICO) as PublicoAlvoInformativoApi[];

const informativoVazio = (): InformativoDTO => ({
  titulo: "",
  conteudo: "",
  tipo: "INFORMATIVO",
  publicoAlvo: "TODOS",
  prioridade: "NORMAL",
  exibirNoLogin: true,
  obrigatorio: false,
  ativo: true,
  dataInicio: new Date().toISOString().slice(0, 10),
});

export default function Informativos() {
  const { user } = usarAutenticacao();
  const podeEditar = canWrite(user, "/informativos") || canWrite(user, "/avisos");
  const [lista, setLista] = useState<InformativoDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [form, setForm] = useState<InformativoDTO>(informativoVazio());
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [excluirId, setExcluirId] = useState<number | null>(null);
  const [leiturasId, setLeiturasId] = useState<number | null>(null);
  const [leituras, setLeituras] = useState<InformativoLeituraDTO[]>([]);
  const [carregandoLeituras, setCarregandoLeituras] = useState(false);

  const carregar = useCallback(async () => {
    if (!podeEditar) return;
    setCarregando(true);
    try {
      const dados = await listarInformativosAdmin();
      setLista(dados ?? []);
    } catch {
      setLista([]);
    } finally {
      setCarregando(false);
    }
  }, [podeEditar]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const abrirNovo = () => {
    setForm(informativoVazio());
    setEditandoId(null);
    setDialogAberto(true);
  };

  const abrirEditar = (item: InformativoDTO) => {
    setForm({ ...item });
    setEditandoId(item.id ?? null);
    setDialogAberto(true);
  };

  const salvar = async () => {
    if (!form.titulo.trim() || !form.conteudo.trim()) {
      toast.error("Preencha título e mensagem.");
      return;
    }
    setSalvando(true);
    try {
      if (editandoId) {
        await atualizarInformativo(editandoId, form);
        setLista((prev) =>
          prev.map((i) => (i.id === editandoId ? { ...i, ...form, id: editandoId } : i)),
        );
        toast.success("Informativo atualizado.");
      } else {
        const criado = await criarInformativo(form);
        setLista((prev) => [{ ...form, id: criado.idNum }, ...prev]);
        toast.success("Informativo criado.");
      }
      setDialogAberto(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExcluir = async () => {
    if (!excluirId) return;
    try {
      await excluirInformativo(excluirId);
      toast.success("Informativo excluído.");
      setLista((prev) => prev.filter((i) => i.id !== excluirId));
      if (leiturasId === excluirId) {
        setLeiturasId(null);
        setLeituras([]);
      }
    } catch {
      toast.error("Não foi possível excluir.");
    } finally {
      setExcluirId(null);
    }
  };

  const abrirLeituras = async (id: number) => {
    setLeiturasId(id);
    setCarregandoLeituras(true);
    try {
      const dados = await listarLeiturasInformativo(id);
      setLeituras(dados ?? []);
    } catch {
      setLeituras([]);
      toast.error("Não foi possível carregar as leituras.");
    } finally {
      setCarregandoLeituras(false);
    }
  };

  if (!podeEditar) {
    return (
      <LayoutApp>
        <p className="text-muted-foreground">Você não tem permissão para gerenciar informativos.</p>
      </LayoutApp>
    );
  }

  return (
    <LayoutApp>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary" />
              Informativos ao entrar
            </h1>
            <p className="text-sm text-muted-foreground">
              Comunicados exibidos quando o usuário acessa o sistema
            </p>
          </div>
          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button onClick={abrirNovo} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo informativo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editandoId ? "Editar informativo" : "Novo informativo"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={form.titulo}
                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mensagem</Label>
                  <Textarea
                    rows={5}
                    value={form.conteudo}
                    onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={form.tipo ?? "INFORMATIVO"}
                      onValueChange={(v) => setForm({ ...form, tipo: v as TipoInformativoApi })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {LABEL_TIPO[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Público</Label>
                    <Select
                      value={form.publicoAlvo ?? "TODOS"}
                      onValueChange={(v) =>
                        setForm({ ...form, publicoAlvo: v as PublicoAlvoInformativoApi })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PUBLICOS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {LABEL_PUBLICO[p]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Início</Label>
                    <DatePicker
                      value={form.dataInicio ?? ""}
                      onChange={(v) => setForm({ ...form, dataInicio: v || undefined })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fim (opcional)</Label>
                    <DatePicker
                      value={form.dataFim ?? ""}
                      onChange={(v) => setForm({ ...form, dataFim: v || null })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>CTA — rótulo do botão</Label>
                    <Input
                      placeholder="Ex.: Saiba mais"
                      value={form.ctaRotulo ?? ""}
                      onChange={(e) => setForm({ ...form, ctaRotulo: e.target.value || null })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CTA — rota interna</Label>
                    <Input
                      placeholder="Ex.: /eventos"
                      value={form.ctaRota ?? ""}
                      onChange={(e) => setForm({ ...form, ctaRota: e.target.value || null })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Imagem (URL)</Label>
                  <Input
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={form.imagemUrl ?? ""}
                    onChange={(e) => setForm({ ...form, imagemUrl: e.target.value || null })}
                  />
                  {form.imagemUrl && (
                    <img
                      src={form.imagemUrl}
                      alt="Prévia"
                      className="mt-2 max-h-32 rounded-lg border object-cover"
                    />
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">Exibir ao entrar</p>
                      <p className="text-xs text-muted-foreground">Modal no login</p>
                    </div>
                    <Switch
                      checked={form.exibirNoLogin ?? true}
                      onCheckedChange={(v) => setForm({ ...form, exibirNoLogin: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">Obrigatório</p>
                      <p className="text-xs text-muted-foreground">Usuário precisa confirmar leitura</p>
                    </div>
                    <Switch
                      checked={form.obrigatorio ?? false}
                      onCheckedChange={(v) => setForm({ ...form, obrigatorio: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">Ativo</p>
                    </div>
                    <Switch
                      checked={form.ativo ?? true}
                      onCheckedChange={(v) => setForm({ ...form, ativo: v })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogAberto(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => void salvar()} disabled={salvando}>
                  {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {carregando ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : lista.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            Nenhum informativo cadastrado.
          </p>
        ) : (
          <div className="space-y-3">
            {lista.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap gap-1.5">
                      {item.tipo && (
                        <Badge variant={item.tipo === "URGENTE" ? "destructive" : "secondary"}>
                          {LABEL_TIPO[item.tipo]}
                        </Badge>
                      )}
                      <Badge variant="outline">{item.ativo ? "Ativo" : "Inativo"}</Badge>
                      {item.obrigatorio && <Badge variant="outline">Obrigatório</Badge>}
                    </div>
                    <h3 className="font-semibold">{item.titulo}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.conteudo}</p>
                    {item.publicoAlvo && (
                      <p className="text-xs text-muted-foreground">
                        Público: {LABEL_PUBLICO[item.publicoAlvo]}
                      </p>
                    )}
                    {item.totalLeituras != null && (
                      <p className="text-xs text-muted-foreground">
                        {item.totalLeituras} leitura{item.totalLeituras !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    {item.id != null && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => void abrirLeituras(item.id!)}
                      >
                        <Eye className="h-4 w-4" />
                        Ver leituras
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => abrirEditar(item)}>
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setExcluirId(item.id ?? null)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={excluirId != null} onOpenChange={() => setExcluirId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir informativo?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmarExcluir()}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={leiturasId != null} onOpenChange={() => setLeiturasId(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Leituras confirmadas</DialogTitle>
          </DialogHeader>
          {carregandoLeituras ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : leituras.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhuma leitura registrada ainda.
            </p>
          ) : (
            <ul className="space-y-2">
              {leituras.map((l) => (
                <li key={l.id} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">{l.usuarioNome}</p>
                  <p className="text-xs text-muted-foreground">
                    {(l.confirmadoEm ?? l.lidoEm)
                      ? new Date(l.confirmadoEm ?? l.lidoEm!).toLocaleString("pt-BR")
                      : "—"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </LayoutApp>
  );
}
