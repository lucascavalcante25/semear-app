import { useState } from "react";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  UserPlus, 
  Search, 
  Plus,
  Calendar,
  Phone,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Visitante } from "@/types";

// Visitantes de exemplo
const visitantesExemplo: Visitante[] = [
  {
    id: "1",
    name: "Carlos Eduardo",
    phone: "(11) 99999-8888",
    visitDate: new Date(),
    howHeard: "Indicação de amigo",
    notes: "Primeira vez na igreja",
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Fernanda Lima",
    phone: "(11) 98888-7777",
    visitDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    howHeard: "Redes sociais",
    createdAt: new Date(),
  },
  {
    id: "3",
    name: "Ricardo Santos",
    visitDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    howHeard: "Passou em frente",
    createdAt: new Date(),
  },
];

function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isThisWeek(date: Date): boolean {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  return date >= weekAgo && date <= today;
}

interface CartaoVisitanteProps {
  visitante: Visitante;
}

function CartaoVisitante({ visitante }: CartaoVisitanteProps) {
  const visitaHoje = isToday(visitante.visitDate);

  return (
    <Card className={cn(
      "transition-shadow hover:shadow-md",
      visitaHoje && "border-gold bg-gold/5"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold",
            visitaHoje 
              ? "bg-gold text-gold-foreground" 
              : "bg-deep-blue/10 text-deep-blue"
          )}>
            {visitante.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{visitante.name}</h3>
              {visitaHoje && (
                <Badge className="bg-gold text-gold-foreground border-0">
                  Hoje!
                </Badge>
              )}
            </div>
            
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {visitante.visitDate.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
              
              {visitante.phone && (
                <a href={`tel:${visitante.phone}`} className="flex items-center gap-1.5 hover:text-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  {visitante.phone}
                </a>
              )}
              
              {visitante.howHeard && (
                <p className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {visitante.howHeard}
                </p>
              )}
            </div>

            {visitante.notes && (
              <p className="mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                {visitante.notes}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Visitantes() {
  const [buscaTexto, setBuscaTexto] = useState("");
  const [visitantes] = useState<Visitante[]>(visitantesExemplo);
  const [dialogAberto, setDialogAberto] = useState(false);

  const visitantesFiltrados = visitantes.filter((visitante) =>
    visitante.name.toLowerCase().includes(buscaTexto.toLowerCase())
  );

  const visitantesHoje = visitantesFiltrados.filter((v) => isToday(v.visitDate));
  const visitantesSemana = visitantesFiltrados.filter((v) => isThisWeek(v.visitDate) && !isToday(v.visitDate));
  const visitantesAnteriores = visitantesFiltrados.filter((v) => !isThisWeek(v.visitDate));

  return (
    <LayoutApp>
      <div className="space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-deep-blue text-deep-blue-foreground">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Visitantes</h1>
              <p className="text-sm text-muted-foreground">
                {visitantes.length} visitantes registrados
              </p>
            </div>
          </div>

          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Novo Visitante</DialogTitle>
                <DialogDescription>
                  Registre um novo visitante.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input id="name" placeholder="Nome do visitante" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" placeholder="(00) 00000-0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="howHeard">Como conheceu a igreja?</Label>
                  <Input id="howHeard" placeholder="Ex: Indicação de amigo" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea id="notes" placeholder="Alguma observação..." />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogAberto(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setDialogAberto(false)}>
                    Salvar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar visitante..."
            className="pl-10"
            value={buscaTexto}
            onChange={(e) => setBuscaTexto(e.target.value)}
          />
        </div>

        {/* Visitantes de hoje */}
        {visitantesHoje.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gold-dark uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
              Visitantes de Hoje ({visitantesHoje.length})
            </h2>
            <div className="space-y-3">
              {visitantesHoje.map((visitante) => (
                <CartaoVisitante key={visitante.id} visitante={visitante} />
              ))}
            </div>
          </section>
        )}

        {/* Visitantes da semana */}
        {visitantesSemana.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Esta Semana ({visitantesSemana.length})
            </h2>
            <div className="space-y-3">
              {visitantesSemana.map((visitante) => (
                <CartaoVisitante key={visitante.id} visitante={visitante} />
              ))}
            </div>
          </section>
        )}

        {/* Visitantes anteriores */}
        {visitantesAnteriores.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Anteriores ({visitantesAnteriores.length})
            </h2>
            <div className="space-y-3">
              {visitantesAnteriores.map((visitante) => (
                <CartaoVisitante key={visitante.id} visitante={visitante} />
              ))}
            </div>
          </section>
        )}

        {visitantesFiltrados.length === 0 && (
          <div className="text-center py-12">
            <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Nenhum visitante encontrado
            </p>
          </div>
        )}
      </div>
    </LayoutApp>
  );
}
