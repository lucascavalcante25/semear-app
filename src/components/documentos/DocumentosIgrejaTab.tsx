import { useCallback, useEffect, useRef, useState } from "react";
import {
  Download,
  Eye,
  FileText,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  atualizarDocumentoIgreja,
  baixarDocumentoIgreja,
  enviarDocumentoIgreja,
  excluirDocumentoIgreja,
  listarDocumentosIgreja,
  type FiltrosDocumentos,
} from "@/modules/igreja/documentos/api";
import {
  CATEGORIAS_DOCUMENTO,
  LABEL_CATEGORIA,
  type CategoriaDocumentoIgreja,
  type DocumentoIgreja,
} from "@/modules/igreja/documentos/types";
import {
  formatarTamanhoArquivo,
  labelTipoArquivo,
  podeVisualizarInline,
  validarArquivo,
  validarFormDocumento,
  type ErrosFormDocumento,
  type FormDocumento,
} from "@/modules/igreja/documentos/validacao";
import { toast } from "sonner";

const FORM_INICIAL: FormDocumento = {
  nome: "",
  categoria: "",
  dataDocumento: "",
  descricao: "",
  arquivo: null,
};

function formatarData(iso?: string) {
  if (!iso) return "—";
  if (iso.length === 10) {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }
  return new Date(iso).toLocaleDateString("pt-BR");
}

function formatarDataHora(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR");
}

export function DocumentosIgrejaTab() {
  const [documentos, setDocumentos] = useState<DocumentoIgreja[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState<FormDocumento>(FORM_INICIAL);
  const [erros, setErros] = useState<ErrosFormDocumento>({});
  const inputArquivoRef = useRef<HTMLInputElement>(null);

  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("TODAS");
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");

  const [editando, setEditando] = useState<DocumentoIgreja | null>(null);
  const [formEdicao, setFormEdicao] = useState({
    nome: "",
    categoria: "" as CategoriaDocumentoIgreja | "",
    dataDocumento: "",
    descricao: "",
  });
  const [errosEdicao, setErrosEdicao] = useState<ErrosFormDocumento>({});

  const [excluirId, setExcluirId] = useState<number | null>(null);

  const montarFiltros = useCallback((): FiltrosDocumentos => {
    const filtros: FiltrosDocumentos = {};
    if (busca.trim()) filtros.nome = busca.trim();
    if (filtroCategoria !== "TODAS") filtros.categoria = filtroCategoria as CategoriaDocumentoIgreja;
    if (filtroTipo !== "TODOS") filtros.tipoArquivo = filtroTipo;
    if (filtroDataInicio) filtros.dataInicio = filtroDataInicio;
    if (filtroDataFim) filtros.dataFim = filtroDataFim;
    return filtros;
  }, [busca, filtroCategoria, filtroTipo, filtroDataInicio, filtroDataFim]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const dados = await listarDocumentosIgreja(montarFiltros());
      setDocumentos(dados);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível carregar os documentos.");
    } finally {
      setCarregando(false);
    }
  }, [montarFiltros]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const limparFormulario = () => {
    setForm(FORM_INICIAL);
    setErros({});
    if (inputArquivoRef.current) inputArquivoRef.current.value = "";
  };

  const abrirFormulario = () => {
    limparFormulario();
    setFormAberto(true);
  };

  const selecionarArquivo = (file: File | null) => {
    if (!file) {
      setForm((f) => ({ ...f, arquivo: null }));
      return;
    }
    const erro = validarArquivo(file);
    if (erro) {
      setErros((e) => ({ ...e, arquivo: erro }));
      setForm((f) => ({ ...f, arquivo: null }));
      if (inputArquivoRef.current) inputArquivoRef.current.value = "";
      return;
    }
    setErros((e) => ({ ...e, arquivo: undefined }));
    setForm((f) => ({ ...f, arquivo: file }));
  };

  const enviarDocumento = async () => {
    const novosErros = validarFormDocumento(form);
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;
    if (!form.arquivo || !form.categoria) return;

    setEnviando(true);
    try {
      await enviarDocumentoIgreja({
        nome: form.nome.trim(),
        categoria: form.categoria,
        descricao: form.descricao.trim() || undefined,
        dataDocumento: form.dataDocumento || undefined,
        arquivo: form.arquivo,
      });
      toast.success("Documento enviado com sucesso.");
      setFormAberto(false);
      limparFormulario();
      await carregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível enviar o documento.");
    } finally {
      setEnviando(false);
    }
  };

  const abrirEdicao = (doc: DocumentoIgreja) => {
    setEditando(doc);
    setFormEdicao({
      nome: doc.nome,
      categoria: doc.categoria,
      dataDocumento: doc.dataDocumento?.split("T")[0] ?? "",
      descricao: doc.descricao ?? "",
    });
    setErrosEdicao({});
  };

  const salvarEdicao = async () => {
    if (!editando) return;
    const errosVal = validarFormDocumento(
      { ...formEdicao, arquivo: null },
      true,
    );
    setErrosEdicao(errosVal);
    if (Object.keys(errosVal).length > 0 || !formEdicao.categoria) return;

    setSalvandoEdicao(true);
    try {
      await atualizarDocumentoIgreja(editando.id, {
        nome: formEdicao.nome.trim(),
        categoria: formEdicao.categoria,
        descricao: formEdicao.descricao.trim() || undefined,
        dataDocumento: formEdicao.dataDocumento || undefined,
      });
      toast.success("Informações do documento atualizadas.");
      setEditando(null);
      await carregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível salvar as alterações.");
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const confirmarExclusao = async () => {
    if (excluirId == null) return;
    setExcluindo(true);
    try {
      await excluirDocumentoIgreja(excluirId);
      toast.success("Documento removido.");
      setExcluirId(null);
      await carregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível excluir o documento.");
    } finally {
      setExcluindo(false);
    }
  };

  const baixar = async (doc: DocumentoIgreja) => {
    try {
      const blob = await baixarDocumentoIgreja(doc.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.nomeArquivoOriginal || doc.nome;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível baixar o documento.");
    }
  };

  const visualizar = async (doc: DocumentoIgreja) => {
    try {
      const blob = await baixarDocumentoIgreja(doc.id, true);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível visualizar o documento.");
    }
  };

  const tiposDisponiveis = Array.from(new Set(documentos.map((d) => d.tipoArquivo).filter(Boolean)));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Documentos da Igreja</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Guarde arquivos importantes da igreja para consultar quando precisar.
          </p>
          <p className="text-xs text-muted-foreground mt-2 max-w-2xl">
            Você pode guardar estatutos, atas, contratos, certidões, recibos e outros documentos administrativos da igreja.
          </p>
        </div>
        <Button onClick={abrirFormulario} className="w-full sm:w-auto shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar documento
        </Button>
      </div>

      <Card className="border-amber-200/60 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/40">
        <CardContent className="pt-4 pb-4 text-sm text-muted-foreground">
          Por segurança, não envie arquivos executáveis ou documentos que não pertençam à sua igreja.
        </CardContent>
      </Card>

      {formAberto && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Novo documento</CardTitle>
            <CardDescription>Preencha as informações e selecione o arquivo para guardar.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 max-w-2xl">
            <div className="space-y-2">
              <Label htmlFor="doc-nome">Nome do documento *</Label>
              <Input
                id="doc-nome"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                placeholder="Ex.: Estatuto social 2024"
                maxLength={120}
              />
              {erros.nome && <p className="text-sm text-destructive">{erros.nome}</p>}
            </div>

            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select
                value={form.categoria || undefined}
                onValueChange={(v) => setForm((f) => ({ ...f, categoria: v as CategoriaDocumentoIgreja }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_DOCUMENTO.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {LABEL_CATEGORIA[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {erros.categoria && <p className="text-sm text-destructive">{erros.categoria}</p>}
            </div>

            <div className="space-y-2">
              <Label>Data do documento</Label>
              <DatePicker
                value={form.dataDocumento}
                onChange={(v) => setForm((f) => ({ ...f, dataDocumento: v }))}
                placeholder="Opcional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-descricao">Descrição</Label>
              <Textarea
                id="doc-descricao"
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                placeholder="Observações opcionais sobre este documento"
                rows={3}
                maxLength={500}
              />
              {erros.descricao && <p className="text-sm text-destructive">{erros.descricao}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-arquivo">Arquivo *</Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  id="doc-arquivo"
                  ref={inputArquivoRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
                  className="cursor-pointer"
                  onChange={(e) => selecionarArquivo(e.target.files?.[0] ?? null)}
                />
              </div>
              {form.arquivo && (
                <p className="text-xs text-muted-foreground">
                  {form.arquivo.name} — {formatarTamanhoArquivo(form.arquivo.size)}
                </p>
              )}
              {erros.arquivo && <p className="text-sm text-destructive">{erros.arquivo}</p>}
              <p className="text-xs text-muted-foreground">PDF, imagens ou documentos de escritório. Máximo 10 MB.</p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={enviarDocumento} disabled={enviando} className="w-full sm:w-auto">
                {enviando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Salvar documento
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={enviando}
                onClick={() => {
                  setFormAberto(false);
                  limparFormulario();
                }}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Documentos arquivados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1 w-full min-w-0">
              <Label className="text-xs text-muted-foreground">Buscar por nome</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  className="pl-8 w-full"
                  placeholder="Nome do documento"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1 min-w-0">
                <Label className="text-xs text-muted-foreground">Categoria</Label>
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODAS">Todas</SelectItem>
                    {CATEGORIAS_DOCUMENTO.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {LABEL_CATEGORIA[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 min-w-0">
                <Label className="text-xs text-muted-foreground">Tipo de arquivo</Label>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODOS">Todos</SelectItem>
                    {tiposDisponiveis.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {labelTipoArquivo(tipo)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1 w-full min-w-0">
              <Label className="text-xs text-muted-foreground">Período (data do documento)</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <DatePicker value={filtroDataInicio} onChange={setFiltroDataInicio} placeholder="De" />
                <DatePicker value={filtroDataFim} onChange={setFiltroDataFim} placeholder="Até" />
              </div>
            </div>
          </div>

          {carregando ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Carregando documentos...
            </div>
          ) : documentos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <FileText className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="font-medium">Nenhum documento cadastrado ainda.</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Adicione estatutos, atas, contratos, certidões e outros documentos importantes da sua igreja.
              </p>
              {!formAberto && (
                <Button onClick={abrirFormulario} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar primeiro documento
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Tamanho</TableHead>
                      <TableHead>Data do documento</TableHead>
                      <TableHead>Data de envio</TableHead>
                      <TableHead>Enviado por</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentos.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium max-w-[200px]">
                          <span className="line-clamp-2 break-words">{doc.nome}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{LABEL_CATEGORIA[doc.categoria]}</Badge>
                        </TableCell>
                        <TableCell>{labelTipoArquivo(doc.tipoArquivo)}</TableCell>
                        <TableCell>{formatarTamanhoArquivo(doc.tamanhoArquivo)}</TableCell>
                        <TableCell>{formatarData(doc.dataDocumento)}</TableCell>
                        <TableCell>{formatarDataHora(doc.dataUpload)}</TableCell>
                        <TableCell>{doc.usuarioUploadNome ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          <AcoesDocumento
                            doc={doc}
                            onBaixar={() => void baixar(doc)}
                            onVisualizar={() => void visualizar(doc)}
                            onEditar={() => abrirEdicao(doc)}
                            onExcluir={() => setExcluirId(doc.id)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="md:hidden space-y-3">
                {documentos.map((doc) => (
                  <Card key={doc.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium break-words">{doc.nome}</p>
                          <p className="text-xs text-muted-foreground mt-1 truncate">{doc.nomeArquivoOriginal}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => void baixar(doc)}>
                              <Download className="h-4 w-4 mr-2" />
                              Baixar
                            </DropdownMenuItem>
                            {podeVisualizarInline(doc.tipoArquivo) && (
                              <DropdownMenuItem onClick={() => void visualizar(doc)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => abrirEdicao(doc)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar informações
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setExcluirId(doc.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary">{LABEL_CATEGORIA[doc.categoria]}</Badge>
                        <span>{labelTipoArquivo(doc.tipoArquivo)}</span>
                        <span>{formatarTamanhoArquivo(doc.tamanhoArquivo)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="block font-medium text-foreground/80">Data do documento</span>
                          {formatarData(doc.dataDocumento)}
                        </div>
                        <div>
                          <span className="block font-medium text-foreground/80">Enviado em</span>
                          {formatarDataHora(doc.dataUpload)}
                        </div>
                        <div className="col-span-2">
                          <span className="block font-medium text-foreground/80">Enviado por</span>
                          {doc.usuarioUploadNome ?? "—"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={editando != null} onOpenChange={(open) => !open && setEditando(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar informações</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>Nome do documento *</Label>
              <Input
                value={formEdicao.nome}
                onChange={(e) => setFormEdicao((f) => ({ ...f, nome: e.target.value }))}
                maxLength={120}
              />
              {errosEdicao.nome && <p className="text-sm text-destructive">{errosEdicao.nome}</p>}
            </div>
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select
                value={formEdicao.categoria || undefined}
                onValueChange={(v) => setFormEdicao((f) => ({ ...f, categoria: v as CategoriaDocumentoIgreja }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_DOCUMENTO.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {LABEL_CATEGORIA[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errosEdicao.categoria && <p className="text-sm text-destructive">{errosEdicao.categoria}</p>}
            </div>
            <div className="space-y-2">
              <Label>Data do documento</Label>
              <DatePicker
                value={formEdicao.dataDocumento}
                onChange={(v) => setFormEdicao((f) => ({ ...f, dataDocumento: v }))}
                placeholder="Opcional"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formEdicao.descricao}
                onChange={(e) => setFormEdicao((f) => ({ ...f, descricao: e.target.value }))}
                rows={3}
                maxLength={500}
              />
              {errosEdicao.descricao && <p className="text-sm text-destructive">{errosEdicao.descricao}</p>}
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setEditando(null)} disabled={salvandoEdicao}>
              Cancelar
            </Button>
            <Button onClick={() => void salvarEdicao()} disabled={salvandoEdicao}>
              {salvandoEdicao ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={excluirId != null} onOpenChange={(open) => !open && setExcluirId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
            <AlertDialogDescription>
              O documento deixará de aparecer na lista. Esta ação não pode ser desfeita pelo sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void confirmarExclusao();
              }}
              disabled={excluindo}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {excluindo ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AcoesDocumento({
  doc,
  onBaixar,
  onVisualizar,
  onEditar,
  onExcluir,
}: {
  doc: DocumentoIgreja;
  onBaixar: () => void;
  onVisualizar: () => void;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" title="Baixar" onClick={onBaixar}>
        <Download className="h-4 w-4" />
      </Button>
      {podeVisualizarInline(doc.tipoArquivo) && (
        <Button variant="ghost" size="icon" title="Visualizar" onClick={onVisualizar}>
          <Eye className="h-4 w-4" />
        </Button>
      )}
      <Button variant="ghost" size="icon" title="Editar" onClick={onEditar}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Excluir"
        onClick={onExcluir}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
