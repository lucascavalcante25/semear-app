import { useEffect, useState } from "react";
import { LayoutSuperAdmin } from "@/components/layout/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  aprovarSolicitacao,
  listarSolicitacoes,
  rejeitarSolicitacao,
  type SolicitacaoAcesso,
} from "@/modules/igreja/solicitacao";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export default function SolicitacoesSuperAdmin() {
  const [lista, setLista] = useState<SolicitacaoAcesso[]>([]);
  const [obs, setObs] = useState<Record<number, string>>({});
  const [carregando, setCarregando] = useState(true);

  const carregar = async () => {
    setCarregando(true);
    try {
      setLista(await listarSolicitacoes("PENDENTE"));
    } catch {
      setLista([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { void carregar(); }, []);

  const aprovar = async (id: number) => {
    try {
      await aprovarSolicitacao(id, obs[id]);
      toast.success("Solicitação aprovada! Igreja e admin criados.");
      void carregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao aprovar.");
    }
  };

  const rejeitar = async (id: number) => {
    try {
      await rejeitarSolicitacao(id, obs[id]);
      toast.success("Solicitação rejeitada.");
      void carregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao rejeitar.");
    }
  };

  return (
    <LayoutSuperAdmin>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Solicitações de acesso</h1>
          <p className="text-muted-foreground">Analise pedidos de novas igrejas.</p>
        </div>
        {carregando ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : lista.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma solicitação pendente.</p>
        ) : (
          <div className="space-y-4">
            {lista.map((s) => (
              <Card key={s.id}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{s.nomeIgreja}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Admin: {s.nomeSolicitante}
                      {s.cpf && ` · CPF ${s.cpf}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                  </div>
                  <Badge variant="secondary">Pendente</Badge>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-900">
                    <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>
                      Ao aprovar, <strong>{s.nomeSolicitante}</strong> será criado como{" "}
                      <strong>administrador da igreja</strong> com permissão para aprovar pré-cadastros,
                      configurar PIX, identidade visual e plano de leitura.
                    </p>
                  </div>
                  {s.dataNascimento && <p>Nascimento: {s.dataNascimento}</p>}
                  {s.telefone && <p>Telefone: {s.telefone}</p>}
                  {s.nomeContatoEmergencia && <p>Emergência: {s.nomeContatoEmergencia}</p>}
                  {s.quantidadeMembros != null && <p>Membros (aprox.): {s.quantidadeMembros}</p>}
                  {(s.cidade || s.estado) && <p>Local: {[s.cidade, s.estado].filter(Boolean).join(" - ")}</p>}
                  {s.cep && <p>CEP: {s.cep}</p>}
                  {(s.endereco || s.numero || s.bairro) && (
                    <p>
                      Endereço: {[s.endereco, s.numero, s.bairro].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {s.cnpjIgreja && <p>CNPJ: {s.cnpjIgreja}</p>}
                  {s.mensagem && <p className="italic text-muted-foreground">{s.mensagem}</p>}
                  <Textarea
                    placeholder="Observação para o solicitante..."
                    value={obs[s.id!] || ""}
                    onChange={(e) => setObs({ ...obs, [s.id!]: e.target.value })}
                  />
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" onClick={() => aprovar(s.id!)}>Aprovar</Button>
                    <Button size="sm" variant="destructive" onClick={() => rejeitar(s.id!)}>Rejeitar</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </LayoutSuperAdmin>
  );
}
