import { useCallback, useEffect, useState } from "react";
import { LayoutApp } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, Loader2, Plus, Search } from "lucide-react";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { usarNotificacoes } from "@/contexts/NotificationsContext";
import { ModalNovoPedidoOracao } from "@/components/oracao/ModalNovoPedidoOracao";
import { CardPedidoOracao } from "@/components/oracao/CardPedidoOracao";
import {
  listarLiderancaOracao,
  listarMeusPedidosOracao,
  listarMuralOracao,
  LABEL_CATEGORIA,
  LABEL_STATUS,
  type CategoriaPedidoOracaoApi,
  type PedidoOracaoDTO,
  type StatusPedidoOracaoApi,
} from "@/modules/oracao/api";

const ROLES_LIDERANCA = [
  "admin",
  "admin_igreja",
  "pastor",
  "copastor",
  "secretaria",
  "lider",
];

function ehLideranca(role?: string) {
  return role != null && ROLES_LIDERANCA.includes(role);
}

export default function PedidosOracao() {
  const { user } = usarAutenticacao();
  const { refreshNotificacoes } = usarNotificacoes();
  const [aba, setAba] = useState("mural");
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [mural, setMural] = useState<PedidoOracaoDTO[]>([]);
  const [meus, setMeus] = useState<PedidoOracaoDTO[]>([]);
  const [lideranca, setLideranca] = useState<PedidoOracaoDTO[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("__todos__");
  const [filtroStatus, setFiltroStatus] = useState<string>("__todos__");

  const mostrarLideranca = ehLideranca(user?.role);

  const filtrosLideranca = {
    categoria:
      filtroCategoria !== "__todos__"
        ? (filtroCategoria as CategoriaPedidoOracaoApi)
        : undefined,
    status:
      filtroStatus !== "__todos__" ? (filtroStatus as StatusPedidoOracaoApi) : undefined,
    page: 0,
    size: 200,
  };

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [m, me, l] = await Promise.all([
        listarMuralOracao(),
        listarMeusPedidosOracao(),
        mostrarLideranca ? listarLiderancaOracao(filtrosLideranca) : Promise.resolve([]),
      ]);
      setMural(m ?? []);
      setMeus(me ?? []);
      setLideranca(l ?? []);
    } catch {
      setMural([]);
      setMeus([]);
      setLideranca([]);
    } finally {
      setCarregando(false);
      if (mostrarLideranca) {
        void refreshNotificacoes();
      }
    }
  }, [mostrarLideranca, filtroCategoria, filtroStatus, refreshNotificacoes]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const filtrar = (lista: PedidoOracaoDTO[]) => {
    const q = busca.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter(
      (p) =>
        p.titulo.toLowerCase().includes(q) ||
        p.descricao.toLowerCase().includes(q) ||
        (p.usuarioNome?.toLowerCase().includes(q) ?? false),
    );
  };

  const renderLista = (lista: PedidoOracaoDTO[], modoLideranca = false, vazio: string) => {
    const filtrada = filtrar(lista);
    if (carregando) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }
    if (filtrada.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Heart className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>{vazio}</p>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {filtrada.map((p) => (
          <CardPedidoOracao
            key={p.id}
            pedido={p}
            modoLideranca={modoLideranca}
            onAtualizado={() => void carregar()}
          />
        ))}
      </div>
    );
  };

  return (
    <LayoutApp>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              Pedidos de Oração
            </h1>
            <p className="text-sm text-muted-foreground">
              Compartilhe necessidades e interceda pela igreja
            </p>
          </div>
          <Button onClick={() => setModalAberto(true)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Novo pedido
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pedidos..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={aba} onValueChange={setAba}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="mural">Mural</TabsTrigger>
            <TabsTrigger value="meus">Meus pedidos</TabsTrigger>
            {mostrarLideranca && (
              <TabsTrigger value="lideranca">
                Liderança
                {lideranca.filter((p) => p.status === "AGUARDANDO_APROVACAO").length > 0 && (
                  <span className="ml-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5">
                    {lideranca.filter((p) => p.status === "AGUARDANDO_APROVACAO").length}
                  </span>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="mural" className="mt-4">
            {renderLista(
              mural,
              false,
              "Nenhum pedido no mural. Seja o primeiro a compartilhar uma necessidade.",
            )}
          </TabsContent>

          <TabsContent value="meus" className="mt-4">
            {renderLista(meus, false, "Você ainda não enviou pedidos de oração.")}
          </TabsContent>

          {mostrarLideranca && (
            <TabsContent value="lideranca" className="mt-4 space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger className="sm:w-44">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__todos__">Todas categorias</SelectItem>
                    {Object.entries(LABEL_CATEGORIA).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="sm:w-44">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__todos__">Todos status</SelectItem>
                    {Object.entries(LABEL_STATUS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {renderLista(
                lideranca,
                true,
                "Nenhum pedido pendente de acompanhamento.",
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>

      <ModalNovoPedidoOracao
        aberto={modalAberto}
        onAbertoChange={setModalAberto}
        onCriado={() => void carregar()}
      />
    </LayoutApp>
  );
}
