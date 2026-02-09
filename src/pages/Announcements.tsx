import { useState } from "react";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Megaphone, 
  Search, 
  Plus,
  Pin,
  AlertTriangle,
  Calendar,
  Edit,
  Trash2,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Aviso } from "@/types";

// Avisos de exemplo
const avisosExemplo: Aviso[] = [
  {
    id: "1",
    title: "Culto de Santa Ceia",
    content: "Neste domingo teremos culto de Santa Ceia às 19h. Venha preparado para comungar com Cristo. Traga sua família e amigos para este momento especial.",
    type: "fixed",
    startDate: new Date(),
    isActive: true,
    createdAt: new Date(),
    createdBy: "Pastor João",
  },
  {
    id: "2",
    title: "Retiro Espiritual de Carnaval",
    content: "Inscrições abertas para o retiro de carnaval! Serão 3 dias de comunhão, louvor e Palavra. Vagas limitadas a 50 pessoas. Valor: R$ 350.",
    type: "urgent",
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    isActive: true,
    createdAt: new Date(),
    createdBy: "Secretaria",
  },
  {
    id: "3",
    title: "Ensaio do Louvor",
    content: "Ensaio do ministério de louvor toda quarta-feira às 20h na igreja. Todos os músicos e vocalistas devem comparecer.",
    type: "normal",
    startDate: new Date(),
    isActive: true,
    createdAt: new Date(),
    createdBy: "Líder de Louvor",
  },
  {
    id: "4",
    title: "Campanha de Arrecadação",
    content: "Estamos arrecadando roupas e alimentos para famílias carentes. Traga sua doação até o final do mês.",
    type: "normal",
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    isActive: true,
    createdAt: new Date(),
    createdBy: "Diaconia",
  },
];

const typeConfig = {
  fixed: {
    icon: Pin,
    label: "Fixo",
    badgeClass: "bg-olive/10 text-olive border-olive/20",
    cardClass: "border-olive/30 bg-olive/5",
  },
  urgent: {
    icon: AlertTriangle,
    label: "Urgente",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
    cardClass: "border-destructive/30 bg-destructive/5",
  },
  normal: {
    icon: Megaphone,
    label: "Normal",
    badgeClass: "bg-muted text-muted-foreground border-border",
    cardClass: "",
  },
};

interface CartaoAvisoProps {
  aviso: Aviso;
  aoEditar: (aviso: Aviso) => void;
  aoExcluir: (id: string) => void;
}

function CartaoAviso({ aviso, aoEditar, aoExcluir }: CartaoAvisoProps) {
  const config = typeConfig[aviso.type];
  const Icon = config.icon;

  return (
    <Card className={cn("transition-shadow hover:shadow-md", config.cardClass)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            aviso.type === "urgent" ? "bg-destructive/10 text-destructive" :
            aviso.type === "fixed" ? "bg-olive/10 text-olive" :
            "bg-muted text-muted-foreground"
          )}>
            <Icon className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{aviso.title}</h3>
              <Badge variant="outline" className={cn("text-xs", config.badgeClass)}>
                {config.label}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              {aviso.content}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {aviso.startDate.toLocaleDateString("pt-BR")}
                {aviso.endDate && (
                  <> até {aviso.endDate.toLocaleDateString("pt-BR")}</>
                )}
              </span>
              <span>Por: {aviso.createdBy}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => aoEditar(aviso)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => aoExcluir(aviso.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaginaAvisos() {
  const [buscaTexto, setBuscaTexto] = useState("");
  const [avisos] = useState<Aviso[]>(avisosExemplo);
  const [dialogAberto, setDialogAberto] = useState(false);

  const avisosFiltrados = avisos.filter((a) =>
    a.title.toLowerCase().includes(buscaTexto.toLowerCase()) ||
    a.content.toLowerCase().includes(buscaTexto.toLowerCase())
  );

  const avisosFixos = avisosFiltrados.filter((a) => a.type === "fixed");
  const avisosUrgentes = avisosFiltrados.filter((a) => a.type === "urgent");
  const avisosNormais = avisosFiltrados.filter((a) => a.type === "normal");

  const editarAviso = (aviso: Aviso) => {
    console.log("Editar aviso:", aviso);
  };

  const excluirAviso = (id: string) => {
    console.log("Excluir aviso:", id);
  };

  return (
    <LayoutApp>
      <div className="space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold text-gold-foreground">
              <Megaphone className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Avisos</h1>
              <p className="text-sm text-muted-foreground">
                {avisos.length} avisos ativos
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
                <DialogTitle>Novo Aviso</DialogTitle>
                <DialogDescription>
                  Crie um novo aviso para a igreja.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input id="title" placeholder="Título do aviso" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo *</Label>
                  <Textarea id="content" placeholder="Escreva o aviso..." rows={4} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select defaultValue="normal">
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de aviso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="fixed">Fixo</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data início</Label>
                    <Input id="startDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data fim (opcional)</Label>
                    <Input id="endDate" type="date" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Ativo</Label>
                  <Switch id="active" defaultChecked />
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
            placeholder="Buscar avisos..."
            className="pl-10"
            value={buscaTexto}
            onChange={(e) => setBuscaTexto(e.target.value)}
          />
        </div>

        {/* Avisos fixos */}
        {avisosFixos.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-olive uppercase tracking-wider mb-3 flex items-center gap-2">
              <Pin className="h-4 w-4" />
              Avisos Fixos
            </h2>
            <div className="space-y-3">
              {avisosFixos.map((a) => (
                <CartaoAviso
                  key={a.id}
                  aviso={a}
                  aoEditar={editarAviso}
                  aoExcluir={excluirAviso}
                />
              ))}
            </div>
          </section>
        )}

        {/* Avisos urgentes */}
        {avisosUrgentes.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-destructive uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Avisos Urgentes
            </h2>
            <div className="space-y-3">
              {avisosUrgentes.map((a) => (
                <CartaoAviso
                  key={a.id}
                  aviso={a}
                  aoEditar={editarAviso}
                  aoExcluir={excluirAviso}
                />
              ))}
            </div>
          </section>
        )}

        {/* Avisos normais */}
        {avisosNormais.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Outros Avisos
            </h2>
            <div className="space-y-3">
              {avisosNormais.map((a) => (
                <CartaoAviso
                  key={a.id}
                  aviso={a}
                  aoEditar={editarAviso}
                  aoExcluir={excluirAviso}
                />
              ))}
            </div>
          </section>
        )}

        {avisosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Nenhum aviso encontrado
            </p>
          </div>
        )}
      </div>
    </LayoutApp>
  );
}
