import { useState } from "react";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Music, 
  Search, 
  Plus, 
  FileText,
  Youtube,
  MoreVertical,
  Edit,
  Trash2,
  GripVertical,
  List
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { GrupoLouvor, Louvor } from "@/types";

// Louvores de exemplo
const louvoresExemplo: Louvor[] = [
  {
    id: "1",
    title: "Grandioso És Tu",
    artist: "Harpa Cristã",
    key: "G",
    tempo: "Moderado",
    type: "worship",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "Oceanos",
    artist: "Hillsong",
    key: "D",
    tempo: "Lento",
    type: "worship",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    title: "Vem Espírito Santo",
    artist: "Ministério Zoe",
    key: "E",
    tempo: "Lento",
    type: "communion",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    title: "Ele É Exaltado",
    artist: "Diante do Trono",
    key: "A",
    tempo: "Alegre",
    type: "jubilee",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Grupos de exemplo
const gruposExemplo: GrupoLouvor[] = [
  {
    id: "1",
    name: "Domingo - Manhã",
    date: new Date(),
    praises: ["1", "2", "3"],
    order: 1,
    createdAt: new Date(),
    createdBy: "Líder",
  },
  {
    id: "2",
    name: "Domingo - Noite",
    date: new Date(),
    praises: ["4"],
    order: 2,
    createdAt: new Date(),
    createdBy: "Líder",
  },
];

const typeConfig = {
  worship: { label: "Adoração", color: "bg-deep-blue/10 text-deep-blue border-deep-blue/20" },
  jubilee: { label: "Júbilo", color: "bg-gold/10 text-gold-dark border-gold/20" },
  communion: { label: "Ceia", color: "bg-olive/10 text-olive border-olive/20" },
  offering: { label: "Oferta", color: "bg-muted text-muted-foreground border-border" },
};

interface CartaoLouvorProps {
  louvor: Louvor;
  aoEditar: (louvor: Louvor) => void;
  aoExcluir: (id: string) => void;
  showDrag?: boolean;
}

function CartaoLouvor({ louvor, aoEditar, aoExcluir, showDrag }: CartaoLouvorProps) {
  const config = typeConfig[louvor.type];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {showDrag && (
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
          )}
          
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold-dark font-bold text-sm">
            {louvor.key}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{louvor.title}</h3>
              <Badge variant="outline" className={cn("text-xs", config.color)}>
                {config.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{louvor.artist}</p>
          </div>

          <div className="flex items-center gap-1">
            {louvor.chordsUrl && (
              <Button variant="ghost" size="icon-sm" asChild>
                <a href={louvor.chordsUrl} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4" />
                </a>
              </Button>
            )}
            {louvor.youtubeUrl && (
              <Button variant="ghost" size="icon-sm" asChild>
                <a href={louvor.youtubeUrl} target="_blank" rel="noopener noreferrer">
                  <Youtube className="h-4 w-4" />
                </a>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => aoEditar(louvor)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => aoExcluir(louvor.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaginaLouvores() {
  const [buscaTexto, setBuscaTexto] = useState("");
  const [louvores] = useState<Louvor[]>(louvoresExemplo);
  const [grupos] = useState<GrupoLouvor[]>(gruposExemplo);
  const [dialogAberto, setDialogAberto] = useState(false);

  const louvoresFiltrados = louvores.filter((louvor) =>
    louvor.title.toLowerCase().includes(buscaTexto.toLowerCase()) ||
    louvor.artist.toLowerCase().includes(buscaTexto.toLowerCase())
  );

  const editarLouvor = (louvor: Louvor) => {
    console.log("Editar louvor:", louvor);
  };

  const excluirLouvor = (id: string) => {
    console.log("Excluir louvor:", id);
  };

  const obterLouvorPorId = (id: string) => louvores.find((p) => p.id === id);

  return (
    <LayoutApp>
      <div className="space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold text-gold-foreground">
              <Music className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Louvores</h1>
              <p className="text-sm text-muted-foreground">
                {louvores.length} louvores cadastrados
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
                <DialogTitle>Novo Louvor</DialogTitle>
                <DialogDescription>
                  Cadastre um novo louvor no repertório.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input id="title" placeholder="Nome do louvor" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist">Artista/Ministério *</Label>
                  <Input id="artist" placeholder="Ex: Hillsong" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="key">Tonalidade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Tom" />
                      </SelectTrigger>
                      <SelectContent>
                        {["C", "D", "E", "F", "G", "A", "B"].map((key) => (
                          <SelectItem key={key} value={key}>{key}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="worship">Adoração</SelectItem>
                        <SelectItem value="jubilee">Júbilo</SelectItem>
                        <SelectItem value="communion">Ceia</SelectItem>
                        <SelectItem value="offering">Oferta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube">Link do YouTube</Label>
                  <Input id="youtube" placeholder="https://youtube.com/..." />
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

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all" className="gap-2">
              <Music className="h-4 w-4" />
              Repertório
            </TabsTrigger>
            <TabsTrigger value="groups" className="gap-2">
              <List className="h-4 w-4" />
              Grupos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar louvor..."
                className="pl-10"
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
              />
            </div>

            {/* Lista de louvores */}
            <div className="space-y-3">
              {louvoresFiltrados.map((louvor) => (
                <CartaoLouvor
                  key={louvor.id}
                  louvor={louvor}
                  aoEditar={editarLouvor}
                  aoExcluir={excluirLouvor}
                />
              ))}

              {louvoresFiltrados.length === 0 && (
                <div className="text-center py-12">
                  <Music className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Nenhum louvor encontrado
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="groups" className="mt-4 space-y-4">
            <Button variant="outline" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Criar Novo Grupo
            </Button>

            {grupos.map((group) => (
              <Card key={group.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    {group.name}
                    <Badge variant="secondary" className="text-xs">
                      {group.praises.length} louvores
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {group.praises.map((praiseId) => {
                    const louvor = obterLouvorPorId(praiseId);
                    if (!louvor) return null;
                    return (
                      <CartaoLouvor
                        key={louvor.id}
                        louvor={louvor}
                        aoEditar={editarLouvor}
                        aoExcluir={excluirLouvor}
                        showDrag
                      />
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </LayoutApp>
  );
}
