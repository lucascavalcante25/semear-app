import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookMarked,
  Plus,
  Calendar,
  Share2,
  Heart,
  Loader2,
  Bookmark,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { requisicaoApi, URL_BASE_API } from "@/modules/api/client";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { useIgrejaConfiguracao } from "@/contexts/IgrejaContext";
import { buildBibliaUrl } from "@/lib/versiculo-ref";
import { livrosBiblia, type LivroBiblia } from "@/data/bible-books";

const URL_API_BIBLIA = "https://bible-api.com";
const VERSAO_BIBLIA = "almeida";

const MESES = [
  "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
  "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO",
];

const DIAS_SEMANA = [
  "DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO",
];

type VersiculoApi = { verse: number; text: string };
type RespostaCapituloApi = { verses: VersiculoApi[] };

function montarReferencia(livro: LivroBiblia, cap: number, vIni: number, vFim: number): string {
  return vIni === vFim
    ? `${livro.name} ${cap}:${vIni}`
    : `${livro.name} ${cap}:${vIni}-${vFim}`;
}

type DevocionalApi = {
  id: number;
  titulo: string;
  conteudo: string;
  versiculoBase?: string;
  textoVersiculo?: string;
  dataPublicacao: string;
};

interface ConteudoDevocionalProps {
  titulo: string;
  mes: string;
  dia: number;
  diaSemana: string;
  versiculoTexto: string;
  versiculoReferencia: string;
  conteudo: string;
}

function ConteudoDevocional({
  titulo,
  mes,
  dia,
  diaSemana,
  versiculoTexto,
  versiculoReferencia,
  conteudo,
}: ConteudoDevocionalProps) {
  const navigate = useNavigate();
  const { nomeExibicao } = useIgrejaConfiguracao();
  const [salvo, setSalvo] = useState(false);
  const [lido, setLido] = useState(false);
  const [amenCount, setAmenCount] = useState(0);
  const [amenClicado, setAmenClicado] = useState(false);

  const urlVersiculo = buildBibliaUrl(versiculoReferencia);

  const compartilhar = () => {
    const text = `📖 ${titulo}\n\n"${versiculoTexto}" — ${versiculoReferencia}\n\n${conteudo}\n\n— Devocional ${nomeExibicao}`;
    if (navigator.share) {
      navigator.share({ title: titulo, text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  const paragrafos = conteudo.split(/\n\n+/).filter(Boolean);

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-olive/[0.04] via-background to-gold/[0.04]" />

      <div className="relative max-w-2xl mx-auto space-y-10 pb-12">
        {/* Cabeçalho */}
        <header className="text-center py-10">
          <p className="text-sm font-medium tracking-[0.3em] text-muted-foreground uppercase">
            {mes}
          </p>
          <p className="text-6xl md:text-7xl font-extralight text-foreground mt-1 tracking-tight">
            {dia}
          </p>
          <p className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase mt-2">
            {diaSemana}
          </p>
        </header>

        {/* Título */}
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground leading-tight">
          {titulo}
        </h2>

        {/* Versículo (texto do banco) */}
        <section>
          <div className="rounded-2xl bg-gradient-to-br from-olive/12 to-gold/8 border border-olive/20 p-6 md:p-8">
            <p className="text-lg md:text-xl italic text-foreground leading-relaxed">
              "{versiculoTexto}"
            </p>
            <button
              type="button"
              onClick={() => navigate(urlVersiculo)}
              className="mt-4 text-sm font-semibold text-olive hover:text-olive-dark hover:underline underline-offset-2 transition-colors flex items-center gap-1"
            >
              — {versiculoReferencia}
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>

        {/* Reflexão (conteúdo do banco) */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Reflexão
          </h3>
          <div className="space-y-4">
            {paragrafos.map((p, i) => (
              <p key={i} className="text-base md:text-lg text-foreground leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </section>

        {/* Ações */}
        <section className="flex flex-wrap items-center gap-3 pt-6 border-t">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setSalvo(!salvo)}>
            <Bookmark className={cn("h-4 w-4", salvo && "fill-current")} />
            Salvar
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={compartilhar}>
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setLido(!lido)}>
            <CheckCircle2 className={cn("h-4 w-4", lido && "text-green-600")} />
            Marcar como lido
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn("gap-2", amenClicado && "border-gold bg-gold/10")}
            onClick={() => {
              if (!amenClicado) {
                setAmenCount((c) => c + 1);
                setAmenClicado(true);
              }
            }}
          >
            <Heart className={cn("h-4 w-4", amenClicado && "fill-current text-gold")} />
            Amém {amenCount > 0 && `(${amenCount})`}
          </Button>
        </section>
      </div>
    </div>
  );
}

function FormularioNovoDevocional({
  onSucesso,
  onCancelar,
}: {
  onSucesso: () => void;
  onCancelar: () => void;
}) {
  const [titulo, setTitulo] = useState("");
  const [livroId, setLivroId] = useState<string>("");
  const [capitulo, setCapitulo] = useState<number>(1);
  const [versoInicio, setVersoInicio] = useState<number>(1);
  const [versoFim, setVersoFim] = useState<number>(1);
  const [reflexao, setReflexao] = useState("");
  const [versosCapitulo, setVersosCapitulo] = useState<VersiculoApi[]>([]);
  const [carregandoVersos, setCarregandoVersos] = useState(false);
  const [erroVersos, setErroVersos] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  const livro = livrosBiblia.find((b) => b.id === livroId) ?? null;

  const buscarCapitulo = useCallback(async () => {
    if (!livro) return;
    setCarregandoVersos(true);
    setErroVersos(null);
    try {
      const ref = `${livro.name} ${capitulo}`;
      const query = encodeURIComponent(ref).replace(/%20/g, "+");
      const res = await fetch(
        `${URL_API_BIBLIA}/${query}?translation=${VERSAO_BIBLIA}`
      );
      if (!res.ok) throw new Error("Falha ao carregar capítulo");
      const data = (await res.json()) as RespostaCapituloApi;
      if (!Array.isArray(data?.verses) || data.verses.length === 0) {
        throw new Error("Capítulo não encontrado");
      }
      setVersosCapitulo(data.verses);
      setVersoInicio(1);
      setVersoFim(1);
    } catch (err) {
      setErroVersos((err as Error).message);
      setVersosCapitulo([]);
    } finally {
      setCarregandoVersos(false);
    }
  }, [livro, capitulo]);

  useEffect(() => {
    if (!livro) {
      setVersosCapitulo([]);
      return;
    }
    buscarCapitulo();
  }, [livro?.id, capitulo, buscarCapitulo]);

  const textoVersiculo =
    versosCapitulo.length > 0 && versoInicio >= 1 && versoFim >= versoInicio
      ? versosCapitulo
          .filter((v) => v.verse >= versoInicio && v.verse <= versoFim)
          .map((v) => v.text)
          .join(" ")
      : "";

  const referencia =
    livro && textoVersiculo
      ? montarReferencia(livro, capitulo, versoInicio, versoFim)
      : "";

  const maxVerso = versosCapitulo.length > 0
    ? Math.max(...versosCapitulo.map((v) => v.verse))
    : 1;

  const handlePublicar = async () => {
    if (!titulo.trim() || !textoVersiculo || !reflexao.trim()) {
      setErroEnvio("Preencha título, versículo e reflexão.");
      return;
    }
    if (!URL_BASE_API) {
      setErroEnvio("API não configurada.");
      return;
    }
    setEnviando(true);
    setErroEnvio(null);
    try {
      await requisicaoApi("/api/devocionais", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          titulo: titulo.trim(),
          versiculoBase: referencia,
          textoVersiculo,
          conteudo: reflexao.trim(),
          dataPublicacao: new Date().toISOString().slice(0, 10),
        }),
      });
      onSucesso();
    } catch (err) {
      setErroEnvio((err as Error).message ?? "Erro ao publicar");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Novo Devocional</DialogTitle>
        <DialogDescription>
          Selecione o versículo na caixa de seleção. O texto será preenchido automaticamente. A reflexão é livre.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>Título *</Label>
          <Input
            placeholder="Ex: Fé e Expectativa"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Livro *</Label>
            <Select value={livroId} onValueChange={(v) => { setLivroId(v); setCapitulo(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o livro" />
              </SelectTrigger>
              <SelectContent>
                {livrosBiblia.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Capítulo *</Label>
            <Select
              value={String(capitulo)}
              onValueChange={(v) => setCapitulo(Number(v))}
              disabled={!livro}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {livro &&
                  Array.from({ length: livro.chapters }, (_, i) => i + 1).map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Versículo inicial *</Label>
            <Select
              value={String(versoInicio)}
              onValueChange={(v) => {
                const n = Number(v);
                setVersoInicio(n);
                if (versoFim < n) setVersoFim(n);
              }}
              disabled={!livro || carregandoVersos || versosCapitulo.length === 0}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxVerso }, (_, i) => i + 1).map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Versículo final *</Label>
            <Select
              value={String(versoFim)}
              onValueChange={(v) => setVersoFim(Number(v))}
              disabled={!livro || carregandoVersos || versosCapitulo.length === 0}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxVerso }, (_, i) => i + 1).map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {carregandoVersos && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando versículos...
          </div>
        )}
        {erroVersos && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {erroVersos}
          </div>
        )}

        <div className="space-y-2">
          <Label>Texto do Versículo *</Label>
          <Textarea
            readOnly
            className="bg-muted/50 cursor-not-allowed min-h-[200px]"
            placeholder="Selecione livro, capítulo e versículo acima"
            value={textoVersiculo}
            rows={12}
          />
        </div>

        <div className="space-y-2">
          <Label>Reflexão *</Label>
          <Textarea
            placeholder="A reflexão sobre o versículo. Parágrafos separados por linha em branco."
            value={reflexao}
            onChange={(e) => setReflexao(e.target.value)}
            rows={6}
          />
        </div>

        {erroEnvio && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {erroEnvio}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onCancelar} disabled={enviando}>
            Cancelar
          </Button>
          <Button onClick={handlePublicar} disabled={enviando}>
            {enviando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Publicando...
              </>
            ) : (
              "Publicar"
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

export default function PaginaDevocionais() {
  const { user } = usarAutenticacao();
  const [devocional, setDevocional] = useState<ConteudoDevocionalProps | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const ehAdmin = user?.role === "admin";

  useEffect(() => {
    const buscar = async () => {
      try {
        setCarregando(true);
        setErro(null);
        const hoje = await requisicaoApi<DevocionalApi | undefined>(
          "/api/devocionais/hoje",
          { auth: true }
        );
        if (hoje) {
          const data = new Date(`${hoje.dataPublicacao}T00:00:00`);
          setDevocional({
            titulo: hoje.titulo,
            mes: MESES[data.getMonth()],
            dia: data.getDate(),
            diaSemana: DIAS_SEMANA[data.getDay()],
            versiculoTexto: hoje.textoVersiculo ?? "",
            versiculoReferencia: hoje.versiculoBase ?? "",
            conteudo: hoje.conteudo ?? "",
          });
        } else {
          setDevocional(null);
        }
      } catch (err) {
        console.error("Erro ao buscar devocional:", err);
        setErro("Não foi possível carregar o devocional de hoje.");
        setDevocional(null);
      } finally {
        setCarregando(false);
      }
    };
    buscar();
  }, [refreshKey]);

  return (
    <LayoutApp>
      <div className="space-y-6 animate-fade-in">
        {erro && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-sm text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
            {erro}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-deep-blue text-deep-blue-foreground">
              <BookMarked className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Devocional Diário</h1>
              <p className="text-sm text-muted-foreground">Alimento espiritual para o seu dia</p>
            </div>
          </div>

          {ehAdmin && (
            <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <FormularioNovoDevocional
                  onSucesso={() => {
                    setDialogAberto(false);
                    setRefreshKey((k) => k + 1);
                  }}
                  onCancelar={() => setDialogAberto(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {carregando && (
          <div className="flex items-center justify-center py-24 rounded-xl border bg-muted/30">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Carregando...</span>
          </div>
        )}

        {!carregando && devocional && <ConteudoDevocional {...devocional} />}

        {!carregando && !devocional && (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <Calendar className="h-14 w-14 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum devocional para hoje</h3>
              <p className="text-muted-foreground">
                Volte amanhã ou peça a um administrador para publicar.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </LayoutApp>
  );
}
