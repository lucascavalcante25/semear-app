import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIgrejaConfiguracao } from "@/contexts/IgrejaContext";
import { enviarSolicitacaoAcesso } from "@/modules/igreja/solicitacao";
import { toast } from "sonner";

export default function SolicitarAcesso() {
  const { logoUrl, publica } = useIgrejaConfiguracao();
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [form, setForm] = useState({
    nomeSolicitante: "",
    email: "",
    telefone: "",
    nomeIgreja: "",
    cnpjIgreja: "",
    cidade: "",
    estado: "",
    mensagem: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await enviarSolicitacaoAcesso(form);
      setEnviado(true);
      toast.success("Solicitação enviada com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar solicitação.");
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Solicitação enviada!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center text-muted-foreground">
            <p>Recebemos sua solicitação. Em breve entraremos em contato por e-mail.</p>
            <Button asChild><Link to="/login">Voltar ao login</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <img src={logoUrl} alt="" className="h-12 w-12 mx-auto object-contain" />
          <h1 className="text-2xl font-bold">Cadastrar minha igreja</h1>
          <p className="text-muted-foreground text-sm">
            Preencha o formulário para solicitar acesso à plataforma {publica.nomeFantasia || "Semear"}.
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do solicitante *</Label>
                <Input required value={form.nomeSolicitante} onChange={(e) => setForm({ ...form, nomeSolicitante: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>E-mail *</Label>
                <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Telefone / WhatsApp</Label>
                <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Nome da igreja *</Label>
                <Input required value={form.nomeIgreja} onChange={(e) => setForm({ ...form, nomeIgreja: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input value={form.cnpjIgreja} onChange={(e) => setForm({ ...form, cnpjIgreja: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input maxLength={2} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value.toUpperCase() })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Mensagem</Label>
                <Textarea rows={3} value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} />
              </div>
              <Button type="submit" className="w-full" disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar solicitação"}
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link to="/login">Voltar ao login</Link>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
