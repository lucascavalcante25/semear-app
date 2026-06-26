import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Church, ExternalLink, Heart, Loader2, MapPin, Phone, Mail, UserPlus } from "lucide-react";
import { MARCA } from "@/lib/plataforma";
import { resolverUrlLogo } from "@/modules/igreja/api";
import { resolverUrlApi } from "@/modules/api/client";
import {
  criarPedidoOracaoPublico,
  formatarDataEventoPublico,
  LABEL_CATEGORIA_PUBLICA,
  LABEL_DIA_SEMANA,
  obterIgrejaPublicaPorSlug,
  type IgrejaPublicaSiteDTO,
} from "@/modules/public-site/api";
import { useTituloDocumento } from "@/hooks/use-titulo-documento";
import { toast } from "sonner";

export default function PublicIgreja() {
  const { slug } = useParams<{ slug: string }>();
  const [igreja, setIgreja] = useState<IgrejaPublicaSiteDTO | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [dialogOracao, setDialogOracao] = useState(false);
  const [enviandoOracao, setEnviandoOracao] = useState(false);
  const [formOracao, setFormOracao] = useState({
    titulo: "",
    descricao: "",
    nome: "",
    anonimo: false,
  });

  useTituloDocumento({
    igreja: igreja?.nomeFantasia || igreja?.nome,
    area: "produto",
  });

  useEffect(() => {
    if (!slug) {
      setErro("Igreja não encontrada.");
      setCarregando(false);
      return;
    }
    setCarregando(true);
    obterIgrejaPublicaPorSlug(slug)
      .then((dados) => {
        setIgreja(dados);
        if (!dados) setErro("Igreja não encontrada.");
      })
      .catch(() => setErro("Não foi possível carregar os dados da igreja."))
      .finally(() => setCarregando(false));
  }, [slug]);

  const enviarPedidoOracao = async () => {
    if (!slug) return;
    if (!formOracao.titulo.trim() || !formOracao.descricao.trim()) {
      toast.error("Preencha título e descrição.");
      return;
    }
    setEnviandoOracao(true);
    try {
      await criarPedidoOracaoPublico(slug, {
        titulo: formOracao.titulo.trim(),
        descricao: formOracao.descricao.trim(),
        nome: formOracao.anonimo ? undefined : formOracao.nome.trim() || undefined,
        anonimo: formOracao.anonimo,
      });
      toast.success("Pedido de oração enviado. Nossa equipe irá interceder por você.");
      setDialogOracao(false);
      setFormOracao({ titulo: "", descricao: "", nome: "", anonimo: false });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível enviar o pedido.");
    } finally {
      setEnviandoOracao(false);
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (erro || !igreja) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <Church className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">{erro ?? "Igreja não encontrada."}</p>
        <Button asChild variant="outline">
          <Link to="/landing">Conhecer {MARCA.nome}</Link>
        </Button>
      </div>
    );
  }

  const nome = igreja.nomeFantasia || igreja.nome || "Igreja";
  const logo = resolverUrlLogo(igreja.logoUrl);
  const enderecoCompleto = [igreja.endereco, igreja.bairro, igreja.cidade, igreja.estado]
    .filter(Boolean)
    .join(", ");
  const eventos = igreja.eventosPublicos ?? igreja.eventos ?? [];
  const comunicados = igreja.comunicadosPublicos ?? igreja.avisosPublicos ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <img src={logo} alt="" className="h-12 w-12 rounded-xl object-cover" />
          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate">{nome}</h1>
            {igreja.subtituloIgreja && (
              <p className="text-sm text-muted-foreground truncate">{igreja.subtituloIgreja}</p>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        {igreja.textoBoasVindas && (
          <p className="rounded-xl border bg-card p-4 text-sm leading-relaxed">{igreja.textoBoasVindas}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild className="gap-2 flex-1">
            <Link to="/pre-cadastro">
              <UserPlus className="h-4 w-4" />
              Quero me cadastrar
            </Link>
          </Button>
          <Button variant="outline" className="gap-2 flex-1" onClick={() => setDialogOracao(true)}>
            <Heart className="h-4 w-4" />
            Pedido de oração
          </Button>
        </div>

        {igreja.descricaoIgreja && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sobre nós</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{igreja.descricaoIgreja}</p>
            </CardContent>
          </Card>
        )}

        {(enderecoCompleto || igreja.telefone || igreja.email) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {enderecoCompleto && (
                <p className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  {enderecoCompleto}
                </p>
              )}
              {igreja.telefone && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <a href={`tel:${igreja.telefone}`} className="hover:text-foreground">
                    {igreja.telefone}
                  </a>
                </p>
              )}
              {igreja.email && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <a href={`mailto:${igreja.email}`} className="hover:text-foreground">
                    {igreja.email}
                  </a>
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {igreja.horarioCulto && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Horários de culto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{igreja.horarioCulto}</p>
            </CardContent>
          </Card>
        )}

        {(igreja.cultos?.length ?? 0) > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cultos e reuniões</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {igreja.cultos!.map((culto, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <p className="font-medium">{culto.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    {culto.diaSemana && LABEL_DIA_SEMANA[culto.diaSemana]}
                    {culto.horario && ` às ${culto.horario}`}
                  </p>
                  {culto.descricao && (
                    <p className="text-sm text-muted-foreground mt-1">{culto.descricao}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {comunicados.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comunicados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {comunicados.map((item) => (
                <div key={item.id ?? item.titulo} className="rounded-lg border p-3">
                  <p className="font-medium">{item.titulo}</p>
                  {item.conteudo && (
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{item.conteudo}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {eventos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Próximos eventos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {eventos.map((evento) => (
                <div key={evento.id ?? evento.titulo} className="rounded-lg border overflow-hidden">
                  {evento.imagemUrl && (
                    <img src={resolverUrlApi(evento.imagemUrl)} alt="" className="w-full h-32 object-cover" />
                  )}
                  <div className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{evento.titulo}</p>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {evento.categoria && (
                          <Badge variant="secondary">
                            {LABEL_CATEGORIA_PUBLICA[evento.categoria] ?? evento.categoria}
                          </Badge>
                        )}
                        <Badge variant="outline">Público</Badge>
                      </div>
                    </div>
                    {evento.dataInicio && (
                      <p className="text-sm text-muted-foreground">
                        {formatarDataEventoPublico(evento.dataInicio)}
                      </p>
                    )}
                    {evento.local && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {evento.local}
                      </p>
                    )}
                    {evento.descricao && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{evento.descricao}</p>
                    )}
                    {evento.linkExterno && (
                      <Button size="sm" variant="outline" className="gap-1" asChild>
                        <a href={evento.linkExterno} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Saiba mais
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground pb-6">
          Página pública via{" "}
          <Link to="/landing" className="underline hover:text-foreground">
            {MARCA.nome}
          </Link>
        </p>
      </main>

      <Dialog open={dialogOracao} onOpenChange={setDialogOracao}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pedido de oração</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={formOracao.titulo}
                onChange={(e) => setFormOracao({ ...formOracao, titulo: e.target.value })}
                placeholder="Ex.: Cura, emprego, família..."
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Textarea
                rows={4}
                value={formOracao.descricao}
                onChange={(e) => setFormOracao({ ...formOracao, descricao: e.target.value })}
                placeholder="Compartilhe brevemente sua necessidade..."
              />
            </div>
            {!formOracao.anonimo && (
              <div className="space-y-2">
                <Label>Seu nome (opcional)</Label>
                <Input
                  value={formOracao.nome}
                  onChange={(e) => setFormOracao({ ...formOracao, nome: e.target.value })}
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Checkbox
                id="anonimo"
                checked={formOracao.anonimo}
                onCheckedChange={(v) => setFormOracao({ ...formOracao, anonimo: Boolean(v) })}
              />
              <Label htmlFor="anonimo" className="text-sm font-normal cursor-pointer">
                Enviar anonimamente
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOracao(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void enviarPedidoOracao()} disabled={enviandoOracao}>
              {enviandoOracao && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
