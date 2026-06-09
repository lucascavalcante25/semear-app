import { useEffect, useState } from "react";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIgrejaConfiguracao } from "@/contexts/IgrejaContext";
import {
  atualizarIgrejaAtual,
  atualizarIdentidadeVisual,
  atualizarPixIgreja,
  resolverUrlLogo,
  uploadLogoIgreja,
  type IgrejaConfiguracao,
  type TipoChavePix,
  type TemaPreferido,
} from "@/modules/igreja/api";
import { PALETAS_CORES } from "@/data/paletas-cores";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
export default function ConfiguracoesIgreja() {
  const { user } = usarAutenticacao();
  const { configuracao, recarregar } = useIgrejaConfiguracao();
  const [form, setForm] = useState<Partial<IgrejaConfiguracao>>({});
  const [salvando, setSalvando] = useState(false);
  const [enviandoLogo, setEnviandoLogo] = useState(false);

  useEffect(() => {
    if (configuracao) setForm(configuracao);
  }, [configuracao]);

  if (user?.role !== "admin") {
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
      setForm((f) => ({ ...f, logoUrl: atualizado.logoUrl }));
      await recarregar();
      toast.success("Logo enviado!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao enviar logo.");
    } finally {
      setEnviandoLogo(false);
    }
  };

  const salvarVisual = async () => {
    setSalvando(true);
    try {
      await atualizarIdentidadeVisual(form);
      await recarregar();
      toast.success("Identidade visual atualizada!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const set = (k: keyof IgrejaConfiguracao, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <LayoutApp title="Configurações da Igreja">
      <Tabs defaultValue="dados" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="responsavel">Responsável</TabsTrigger>
          <TabsTrigger value="endereco">Endereço</TabsTrigger>
          <TabsTrigger value="pix">PIX</TabsTrigger>
          <TabsTrigger value="visual">Visual</TabsTrigger>
          <TabsTrigger value="textos">Textos</TabsTrigger>
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
            <CardHeader><CardTitle>Identidade visual</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Logo da igreja</Label>
                <div className="flex flex-wrap items-center gap-4">
                  <img
                    src={resolverUrlLogo(form.logoUrl)}
                    alt="Logo"
                    className="h-16 w-16 rounded-lg border object-contain bg-muted"
                  />
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      disabled={enviandoLogo}
                      onChange={(e) => {
                        const arquivo = e.target.files?.[0];
                        if (arquivo) void enviarLogo(arquivo);
                      }}
                    />
                    <p className="text-xs text-muted-foreground">JPEG, PNG, GIF ou WebP (máx. recomendado: 512×512)</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>URL do logo (alternativa)</Label>
                <Input value={form.logoUrl || ""} onChange={(e) => set("logoUrl", e.target.value)} placeholder="/logo-semear.png" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Cor primária</Label><Input type="color" value={form.corPrimaria || "#5a7a3a"} onChange={(e) => set("corPrimaria", e.target.value)} /></div>
                <div className="space-y-2"><Label>Cor secundária</Label><Input type="color" value={form.corSecundaria || "#1f4d7a"} onChange={(e) => set("corSecundaria", e.target.value)} /></div>
              </div>
              <div className="space-y-2">
                <Label>Tema</Label>
                <Select value={form.temaPreferido || "SISTEMA"} onValueChange={(v) => setForm((f) => ({ ...f, temaPreferido: v as TemaPreferido }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLARO">Claro</SelectItem>
                    <SelectItem value="ESCURO">Escuro</SelectItem>
                    <SelectItem value="SISTEMA">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Paletas sugeridas</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PALETAS_CORES.map((p) => (
                    <button
                      key={p.nome}
                      type="button"
                      className="rounded-lg border p-2 text-left text-xs hover:border-primary"
                      onClick={() => setForm((f) => ({ ...f, corPrimaria: p.primaria, corSecundaria: p.secundaria }))}
                    >
                      <div className="flex gap-1 mb-1">
                        <span className="h-4 w-4 rounded" style={{ background: p.primaria }} />
                        <span className="h-4 w-4 rounded border" style={{ background: p.secundaria }} />
                      </div>
                      {p.nome}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border p-4 space-y-2" style={{ borderColor: form.corPrimaria }}>
                <div className="h-8 rounded text-white text-sm flex items-center px-3" style={{ background: form.corPrimaria }}>Botão principal</div>
                <div className="h-6 rounded text-white text-xs flex items-center px-2" style={{ background: form.corSecundaria }}>Destaque secundário</div>
              </div>
              <Button onClick={salvarVisual} disabled={salvando}>Salvar visual</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="textos">
          <Card>
            <CardHeader><CardTitle>Textos institucionais</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Boas-vindas</Label><Textarea value={form.textoBoasVindas || ""} onChange={(e) => set("textoBoasVindas", e.target.value)} /></div>
              <div className="space-y-2"><Label>Descrição da igreja</Label><Textarea value={form.descricaoIgreja || ""} onChange={(e) => set("descricaoIgreja", e.target.value)} /></div>
              <Button onClick={salvarVisual} disabled={salvando}>Salvar textos</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </LayoutApp>
  );
}
