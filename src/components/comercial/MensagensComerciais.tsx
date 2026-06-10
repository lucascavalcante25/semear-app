import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { obterMensagensComerciaisAdmin, salvarMensagensComerciaisAdmin } from "@/modules/admin/api";
import { MENSAGENS_PADRAO, aplicarPlaceholders, copiarTexto, type MensagensComerciais as Tipo } from "@/lib/mensagens-comerciais";
import { Copy, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const MODELOS: { chave: keyof Tipo; titulo: string }[] = [
  { chave: "mensagemAbordagem", titulo: "Primeira abordagem" },
  { chave: "mensagemPreco", titulo: "Envio de preço" },
  { chave: "mensagemDemo", titulo: "Convite para demonstração" },
  { chave: "mensagemFimTeste", titulo: "Lembrete de fim de teste" },
];

export function SecaoMensagensComerciais() {
  const [mensagens, setMensagens] = useState<Tipo>(MENSAGENS_PADRAO);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    obterMensagensComerciaisAdmin()
      .then((m) => setMensagens({ ...MENSAGENS_PADRAO, ...m }))
      .catch(() => setMensagens(MENSAGENS_PADRAO))
      .finally(() => setCarregando(false));
  }, []);

  const salvar = async () => {
    setSalvando(true);
    try {
      const salvo = await salvarMensagensComerciaisAdmin(mensagens);
      setMensagens({ ...MENSAGENS_PADRAO, ...salvo });
      toast.success("Mensagens salvas!");
    } catch {
      toast.error("Não foi possível salvar as mensagens.");
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Mensagens Comerciais</h2>
          <p className="text-sm text-muted-foreground">
            Edite, salve e copie mensagens prontas para WhatsApp, Instagram ou e-mail. Placeholders:{" "}
            <code className="text-xs">{"{nomePastor}"}</code>, <code className="text-xs">{"{nomeIgreja}"}</code>,{" "}
            <code className="text-xs">{"{diasRestantes}"}</code>, <code className="text-xs">{"{valorMensal}"}</code>
          </p>
        </div>
        <Button onClick={() => void salvar()} disabled={salvando} className="gap-2">
          {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar alterações
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {MODELOS.map(({ chave, titulo }) => (
          <Card key={chave}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{titulo}</CardTitle>
              <CardDescription>Personalize antes de copiar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                rows={8}
                value={mensagens[chave] ?? ""}
                onChange={(e) => setMensagens((m) => ({ ...m, [chave]: e.target.value }))}
              />
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  const texto = aplicarPlaceholders(mensagens[chave] ?? "", {});
                  void copiarTexto(texto).then(() => toast.success("Mensagem copiada!"));
                }}
              >
                <Copy className="h-4 w-4" />
                Copiar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
