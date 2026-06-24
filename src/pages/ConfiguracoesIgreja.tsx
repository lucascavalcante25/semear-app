import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { BookOpen, Calendar, RefreshCw, Camera, Loader2, Globe } from "lucide-react";
import { AvatarCropperModal } from "@/components/avatar/AvatarCropperModal";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useIgrejaConfiguracao } from "@/contexts/IgrejaContext";
import {
  atualizarIgrejaAtual,
  atualizarIdentidadeVisual,
  atualizarPixIgreja,
  atualizarPlanoLeitura,
  reiniciarPlanoLeitura,
  resolverUrlLogo,
  uploadLogoIgreja,
  type IgrejaConfiguracao,
  type TipoChavePix,
} from "@/modules/igreja/api";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { canWrite, podeGerenciarDocumentosIgreja } from "@/auth/permissions";
import { DocumentosIgrejaTab } from "@/components/documentos/DocumentosIgrejaTab";
import { Navigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const ABAS = ["dados", "responsavel", "endereco", "pix", "visual", "textos", "site", "plano", "documentos"] as const;
type AbaConfig = (typeof ABAS)[number];

export default function ConfiguracoesIgreja() {
  const { user } = usarAutenticacao();
  const [searchParams, setSearchParams] = useSearchParams();
  const { configuracao, recarregar, logoUrl: logoUrlAtual } = useIgrejaConfiguracao();
  const abaParam = searchParams.get("aba");
  const abaSolicitada = ABAS.includes(abaParam as AbaConfig) ? (abaParam as AbaConfig) : "dados";
  const podeDocumentos = podeGerenciarDocumentosIgreja(user);
  const abaAtiva: AbaConfig =
    abaSolicitada === "documentos" && !podeDocumentos ? "dados" : abaSolicitada;
  const [form, setForm] = useState<Partial<IgrejaConfiguracao>>({});
  const [dataPlano, setDataPlano] = useState("");
  const [dataReinicioPlano, setDataReinicioPlano] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [salvandoPlano, setSalvandoPlano] = useState(false);
  const [reiniciandoPlano, setReiniciandoPlano] = useState(false);
  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const [cropperLogoAberto, setCropperLogoAberto] = useState(false);
  const [imagemLogoParaRecortar, setImagemLogoParaRecortar] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { pathname } = useLocation();
  const pathnameAnterior = useRef(pathname);

  useEffect(() => {
    if (configuracao) setForm(configuracao);
  }, [configuracao]);

  useEffect(() => {
    if (abaSolicitada === "documentos" && !podeDocumentos) {
      setSearchParams({ aba: "dados" }, { replace: true });
    }
  }, [abaSolicitada, podeDocumentos, setSearchParams]);

  useEffect(() => {
    if (pathnameAnterior.current !== pathname) {
      pathnameAnterior.current = pathname;
      setCropperLogoAberto(false);
      setImagemLogoParaRecortar(null);
    }
  }, [pathname]);

  useEffect(() => {
    const salva = configuracao?.dataInicioPlanoLeitura?.split("T")[0] ?? "";
    setDataPlano(salva);
  }, [configuracao?.dataInicioPlanoLeitura]);

  const dataPlanoSalva = configuracao?.dataInicioPlanoLeitura?.split("T")[0] ?? "";
  const cicloPlano = configuracao?.cicloPlanoLeitura ?? 1;

  const statusPlano = useMemo(() => {
    if (!dataPlanoSalva) {
      return { rotulo: "Não configurado", variante: "secondary" as const };
    }
    const inicio = new Date(`${dataPlanoSalva}T00:00:00`);
    const hoje = new Date();
    inicio.setHours(0, 0, 0, 0);
    hoje.setHours(0, 0, 0, 0);
    if (hoje.getTime() < inicio.getTime()) {
      return { rotulo: "Agendado", variante: "outline" as const };
    }
    return { rotulo: "Em andamento", variante: "default" as const };
  }, [dataPlanoSalva]);

  const diaAtualPlano = useMemo(() => {
    if (!dataPlanoSalva) return null;
    const inicio = new Date(`${dataPlanoSalva}T00:00:00`);
    const hoje = new Date();
    inicio.setHours(0, 0, 0, 0);
    hoje.setHours(0, 0, 0, 0);
    if (hoje.getTime() < inicio.getTime()) return null;
    return Math.min(365, Math.floor((hoje.getTime() - inicio.getTime()) / 86400000) + 1);
  }, [dataPlanoSalva]);

  if (!canWrite(user, "/configuracoes-igreja")) {
    return <Navigate to="/acesso-negado" replace />;
  }

  const salvarGeral = async () => {
    setSalvando(true);
    try {
      await atualizarIgrejaAtual(form);
      await recarregar();
      toast.success("Dados salvos!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const salvarPix = async () => {
    setSalvando(true);
    try {
      await atualizarPixIgreja(form);
      await recarregar();
      toast.success("PIX atualizado!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar PIX.");
    } finally {
      setSalvando(false);
    }
  };

  const enviarLogo = async (arquivo: File) => {
    setEnviandoLogo(true);
    try {
      const atualizado = await uploadLogoIgreja(arquivo);
      setForm((f) => ({
        ...f,
        logoUrl: atualizado.logoUrl,
        dataAtualizacao: atualizado.dataAtualizacao,
      }));
      await recarregar();
      toast.success("Logo enviado!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao enviar logo.");
    } finally {
      setEnviandoLogo(false);
    }
  };

  const handleSelecionarLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    const permitidos = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!permitidos.includes(arquivo.type)) {
      toast.error("Formato não permitido. Use JPEG, PNG, GIF ou WebP.");
      return;
    }
    if (arquivo.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagemLogoParaRecortar(reader.result as string);
      setCropperLogoAberto(true);
    };
    reader.readAsDataURL(arquivo);
    e.target.value = "";
  };

  const handleConfirmarLogoRecortado = async (arquivo: File) => {
    await enviarLogo(arquivo);
    setImagemLogoParaRecortar(null);
  };

  const salvarPlano = async () => {
    if (!dataPlano) {
      toast.error("Informe a data de início do plano.");
      return;
    }
    setSalvandoPlano(true);
    try {
      await atualizarPlanoLeitura(dataPlano);
      await recarregar();
      toast.success("Plano de leitura salvo!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar plano.");
    } finally {
      setSalvandoPlano(false);
    }
  };

  const confirmarReinicioPlano = async () => {
    setReiniciandoPlano(true);
    try {
      await reiniciarPlanoLeitura(dataReinicioPlano || undefined);
      await recarregar();
      toast.success("Plano reiniciado! O calendário coletivo foi atualizado.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao reiniciar plano.");
    } finally {
      setReiniciandoPlano(false);
    }
  };

  const salvarVisual = async () => {
    setSalvando(true);
    try {
      await atualizarIdentidadeVisual({ logoUrl: form.logoUrl });
      await recarregar();
      toast.success("Logo atualizado!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const set = (k: keyof IgrejaConfiguracao, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <LayoutApp title="Configurações da Igreja">
      <Tabs
        value={abaAtiva}
        onValueChange={(v) => setSearchParams({ aba: v }, { replace: true })}
        className="space-y-4"
      >
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="responsavel">Responsável</TabsTrigger>
          <TabsTrigger value="endereco">Endereço</TabsTrigger>
          <TabsTrigger value="pix">PIX</TabsTrigger>
          <TabsTrigger value="visual">Logo</TabsTrigger>
          <TabsTrigger value="textos">Textos</TabsTrigger>
          <TabsTrigger value="site">Site público</TabsTrigger>
          <TabsTrigger value="plano">Plano de Leitura</TabsTrigger>
          {podeDocumentos && <TabsTrigger value="documentos">Documentos</TabsTrigger>}
        </TabsList>

        <TabsContent value="dados">
          <Card>
            <CardHeader><CardTitle>Dados da igreja</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Nome</Label><Input value={form.nome || ""} onChange={(e) => set("nome", e.target.value)} /></div>
              <div className="space-y-2"><Label>Nome fantasia</Label><Input value={form.nomeFantasia || ""} onChange={(e) => set("nomeFantasia", e.target.value)} /></div>
              <div className="space-y-2"><Label>CNPJ</Label><Input value={form.cnpj || ""} onChange={(e) => set("cnpj", e.target.value)} /></div>
              <div className="space-y-2"><Label>E-mail</Label><Input value={form.email || ""} onChange={(e) => set("email", e.target.value)} /></div>
              <div className="space-y-2"><Label>Telefone</Label><Input value={form.telefone || ""} onChange={(e) => set("telefone", e.target.value)} /></div>
              <div className="space-y-2"><Label>Status</Label><Input value={form.status || ""} disabled /></div>
              <Button onClick={salvarGeral} disabled={salvando} className="sm:col-span-2 w-fit">Salvar dados</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responsavel">
          <Card>
            <CardHeader><CardTitle>Pastor / Responsável</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Nome</Label><Input value={form.nomePastorResponsavel || ""} onChange={(e) => set("nomePastorResponsavel", e.target.value)} /></div>
              <div className="space-y-2"><Label>CPF</Label><Input value={form.cpfPastorResponsavel || ""} onChange={(e) => set("cpfPastorResponsavel", e.target.value)} /></div>
              <div className="space-y-2"><Label>Telefone</Label><Input value={form.telefoneResponsavel || ""} onChange={(e) => set("telefoneResponsavel", e.target.value)} /></div>
              <div className="space-y-2"><Label>E-mail</Label><Input value={form.emailResponsavel || ""} onChange={(e) => set("emailResponsavel", e.target.value)} /></div>
              <Button onClick={salvarGeral} disabled={salvando} className="sm:col-span-2 w-fit">Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endereco">
          <Card>
            <CardHeader><CardTitle>Endereço</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>CEP</Label><Input value={form.cep || ""} onChange={(e) => set("cep", e.target.value)} /></div>
              <div className="space-y-2"><Label>Endereço</Label><Input value={form.endereco || ""} onChange={(e) => set("endereco", e.target.value)} /></div>
              <div className="space-y-2"><Label>Número</Label><Input value={form.numero || ""} onChange={(e) => set("numero", e.target.value)} /></div>
              <div className="space-y-2"><Label>Bairro</Label><Input value={form.bairro || ""} onChange={(e) => set("bairro", e.target.value)} /></div>
              <div className="space-y-2"><Label>Cidade</Label><Input value={form.cidade || ""} onChange={(e) => set("cidade", e.target.value)} /></div>
              <div className="space-y-2"><Label>Estado</Label><Input maxLength={2} value={form.estado || ""} onChange={(e) => set("estado", e.target.value)} /></div>
              <div className="space-y-2 sm:col-span-2"><Label>Complemento</Label><Input value={form.complemento || ""} onChange={(e) => set("complemento", e.target.value)} /></div>
              <Button onClick={salvarGeral} disabled={salvando} className="w-fit">Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pix">
          <Card>
            <CardHeader><CardTitle>PIX / Oferta</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo da chave</Label>
                <Select value={form.tipoChavePix || "CNPJ"} onValueChange={(v) => setForm((f) => ({ ...f, tipoChavePix: v as TipoChavePix }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["CPF", "CNPJ", "EMAIL", "TELEFONE", "CHAVE_ALEATORIA"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Chave PIX</Label><Input value={form.chavePix || ""} onChange={(e) => set("chavePix", e.target.value)} /></div>
              <div className="space-y-2"><Label>Titular</Label><Input value={form.nomeTitularPix || ""} onChange={(e) => set("nomeTitularPix", e.target.value)} /></div>
              <div className="space-y-2"><Label>Banco</Label><Input value={form.bancoPix || ""} onChange={(e) => set("bancoPix", e.target.value)} /></div>
              <div className="space-y-2 sm:col-span-2"><Label>Mensagem de agradecimento</Label><Textarea value={form.textoAgradecimentoOferta || ""} onChange={(e) => set("textoAgradecimentoOferta", e.target.value)} /></div>
              <Button onClick={salvarPix} disabled={salvando} className="w-fit">Salvar PIX</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visual">
          <Card>
            <CardHeader>
              <CardTitle>Logo da igreja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground rounded-lg border bg-muted/40 p-3">
                As cores do sistema são padronizadas (verde oliva e azul — padrão Semear).
                Para alternar entre modo claro e escuro, use o menu do seu perfil no canto superior.
              </p>
              <div className="space-y-2">
                <Label>Logo da igreja</Label>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-16 w-16 overflow-hidden rounded-lg ring-2 ring-primary">
                      <img
                        key={logoUrlAtual}
                        src={logoUrlAtual}
                        alt="Logo atual"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">Atual</span>
                  </div>
                  <div className="space-y-2">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={handleSelecionarLogo}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      disabled={enviandoLogo}
                      onClick={() => logoInputRef.current?.click()}
                    >
                      {enviandoLogo ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                      Escolher imagem
                    </Button>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      JPEG, PNG, GIF ou WebP. Você poderá ajustar o enquadramento quadrado antes de salvar.
                    </p>
                  </div>
                </div>
              </div>
              <AvatarCropperModal
                open={cropperLogoAberto}
                onOpenChange={(aberto) => {
                  setCropperLogoAberto(aberto);
                  if (!aberto) setImagemLogoParaRecortar(null);
                }}
                imageSrc={imagemLogoParaRecortar}
                onConfirm={handleConfirmarLogoRecortado}
                title="Ajustar logo da igreja"
                description="Posicione e dê zoom na imagem dentro do quadrado. Ela preencherá o ícone no menu e no cabeçalho."
                confirmLabel="Salvar logo"
                outputFileName="logo-igreja.jpg"
                hint="Arraste para centralizar e use o zoom. O recorte quadrado preenche todo o ícone do menu."
                showAppPreview
                formatoRecorte="rect"
              />
              <div className="space-y-2">
                <Label>URL do logo (alternativa)</Label>
                <Input value={form.logoUrl || ""} onChange={(e) => set("logoUrl", e.target.value)} placeholder="/brand/logo-icon.png" />
              </div>
              <Button onClick={salvarVisual} disabled={salvando}>Salvar logo</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="textos">
          <Card>
            <CardHeader><CardTitle>Textos institucionais</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground rounded-lg border bg-muted/40 p-3">
                Esses textos ficam salvos para a igreja e são exibidos de forma permanente enquanto
                estiverem preenchidos: o subtítulo aparece abaixo do nome no menu; a mensagem de
                boas-vindas no dashboard; a descrição na tela &quot;Mais&quot;.
              </p>
              <div className="space-y-2">
                <Label>Subtítulo no menu</Label>
                <Input
                  value={form.subtituloIgreja || ""}
                  onChange={(e) => set("subtituloIgreja", e.target.value)}
                  placeholder="Ex.: Uma igreja reformada e acolhedora"
                  maxLength={255}
                />
                <p className="text-xs text-muted-foreground">
                  Frase curta exibida abaixo do nome da igreja no topo do menu lateral.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Boas-vindas</Label>
                <Textarea
                  value={form.textoBoasVindas || ""}
                  onChange={(e) => set("textoBoasVindas", e.target.value)}
                  placeholder="Ex.: Seja bem-vindo à nossa família em Cristo!"
                />
                <p className="text-xs text-muted-foreground">
                  Exibido no dashboard, abaixo da saudação com o nome do membro.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Descrição da igreja</Label>
                <Textarea
                  value={form.descricaoIgreja || ""}
                  onChange={(e) => set("descricaoIgreja", e.target.value)}
                  placeholder="Ex.: Comunidade evangélica fundada em 1990, com cultos aos domingos..."
                />
                <p className="text-xs text-muted-foreground">
                  Exibido na tela &quot;Mais&quot;, na seção sobre a igreja.
                </p>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1 pr-4">
                  <Label>Exigir aprovação de pedidos públicos de oração</Label>
                  <p className="text-xs text-muted-foreground">
                    Quando ativo, pedidos públicos de oração precisam ser aprovados pela liderança antes de
                    aparecerem para a igreja.
                  </p>
                </div>
                <Switch
                  checked={form.requerAprovacaoOracaoPublica ?? true}
                  onCheckedChange={(v) => set("requerAprovacaoOracaoPublica", v)}
                />
              </div>
              <Button onClick={salvarGeral} disabled={salvando}>Salvar textos</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="site">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Site público da igreja
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Publique uma página simples da sua igreja para compartilhar com visitantes.
              </p>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1 pr-4">
                  <Label>Ativar site público</Label>
                  <p className="text-xs text-muted-foreground">
                    Quando ativo, a página fica acessível pelo link abaixo.
                  </p>
                </div>
                <Switch
                  checked={form.siteAtivo ?? false}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, siteAtivo: v }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Endereço do site (slug)</Label>
                <Input
                  value={form.slug || ""}
                  onChange={(e) =>
                    set(
                      "slug",
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "-")
                        .replace(/-+/g, "-"),
                    )
                  }
                  placeholder="minha-igreja"
                  maxLength={120}
                />
                <p className="text-xs text-muted-foreground">
                  Use apenas letras minúsculas, números e hífens.
                </p>
              </div>
              {form.slug && (
                <p className="text-sm rounded-lg bg-muted/50 p-3 break-all">
                  Link:{" "}
                  <a
                    href={`${window.location.origin}/i/${form.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    {window.location.origin}/i/{form.slug}
                  </a>
                </p>
              )}
              <div className="space-y-2">
                <Label>Horários dos cultos</Label>
                <Textarea
                  value={form.horarioCulto || ""}
                  onChange={(e) => set("horarioCulto", e.target.value)}
                  placeholder="Ex.: Domingo 19h — Culto de celebração&#10;Quarta 20h — Estudo bíblico"
                  rows={4}
                />
              </div>
              <Button onClick={salvarGeral} disabled={salvando}>
                Salvar site público
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plano">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Plano de leitura anual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Defina quando o plano anual da Bíblia começa para todos os membros da igreja.
                  Antes dessa data, o progresso espiritual no dashboard ficará agendado.
                </p>

                {dataPlanoSalva && (
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">Status</span>
                      <Badge variant={statusPlano.variante}>{statusPlano.rotulo}</Badge>
                      <Badge variant="outline">Ciclo {cicloPlano}</Badge>
                    </div>
                    <p className="text-sm">
                      Início:{" "}
                      <strong>
                        {new Date(`${dataPlanoSalva}T00:00:00`).toLocaleDateString("pt-BR")}
                      </strong>
                    </p>
                    {diaAtualPlano !== null && (
                      <p className="text-sm text-muted-foreground">
                        Hoje é o dia <strong>{diaAtualPlano}</strong> de 365 do plano coletivo.
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2 max-w-sm">
                  <Label htmlFor="dataInicioPlano">Data de início</Label>
                  <DatePicker
                    id="dataInicioPlano"
                    value={dataPlano}
                    onChange={setDataPlano}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={salvarPlano} disabled={salvandoPlano || !dataPlano}>
                    {dataPlanoSalva ? "Salvar alterações" : "Configurar plano"}
                  </Button>
                  {dataPlanoSalva && dataPlano !== dataPlanoSalva && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDataPlano(dataPlanoSalva)}
                    >
                      Desfazer
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Reiniciar plano
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Use quando a igreja quiser começar um novo ciclo do plano anual — por exemplo,
                  após um período de pausa ou no início de um novo ano pastoral.
                </p>
                <div className="rounded-lg border border-amber-200 bg-amber-50/80 dark:border-amber-900 dark:bg-amber-950/30 p-3 text-sm space-y-1">
                  <p className="font-medium text-amber-900 dark:text-amber-100">O que muda</p>
                  <ul className="list-disc pl-4 text-amber-800 dark:text-amber-200/90 space-y-1">
                    <li>O calendário coletivo volta ao dia 1 na nova data.</li>
                    <li>Todos os membros passam a ver as leituras do novo ciclo.</li>
                  </ul>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
                  <p className="font-medium">O que não muda</p>
                  <ul className="list-disc pl-4 text-muted-foreground space-y-1">
                    <li>O progresso pessoal de cada membro (marcações de leitura) é mantido.</li>
                    <li>Favoritos, notas e destaques na Bíblia permanecem intactos.</li>
                  </ul>
                </div>

                {!dataPlanoSalva ? (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0" />
                    Configure a data de início antes de reiniciar o plano.
                  </p>
                ) : (
                  <>
                    <div className="space-y-2 max-w-sm">
                      <Label htmlFor="dataReinicioPlano">Nova data de início (opcional)</Label>
                      <DatePicker
                        id="dataReinicioPlano"
                        value={dataReinicioPlano}
                        onChange={setDataReinicioPlano}
                        placeholder="Usar data de hoje"
                      />
                      <p className="text-xs text-muted-foreground">
                        Deixe em branco para reiniciar a partir de hoje.
                      </p>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={reiniciandoPlano}>
                          Reiniciar plano da igreja
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reiniciar plano de leitura?</AlertDialogTitle>
                          <AlertDialogDescription className="space-y-2">
                            <span className="block">
                              O plano coletivo será reiniciado no ciclo {cicloPlano + 1}, começando em{" "}
                              <strong>
                                {dataReinicioPlano
                                  ? new Date(`${dataReinicioPlano}T00:00:00`).toLocaleDateString("pt-BR")
                                  : "hoje"}
                              </strong>
                              .
                            </span>
                            <span className="block">
                              O progresso individual de leitura de cada membro não será apagado.
                            </span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => void confirmarReinicioPlano()}
                            disabled={reiniciandoPlano}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {reiniciandoPlano ? "Reiniciando…" : "Confirmar reinício"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {podeDocumentos && (
          <TabsContent value="documentos">
            <DocumentosIgrejaTab />
          </TabsContent>
        )}
      </Tabs>
    </LayoutApp>
  );
}
