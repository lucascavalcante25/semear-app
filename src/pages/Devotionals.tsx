import { useState } from "react";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  BookMarked, 
  Search, 
  Plus,
  Calendar,
  Star,
  Share2,
  Heart,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Devocional } from "@/types";

// Devocionais de exemplo
const devocionaisExemplo: Devocional[] = [
  {
    id: "1",
    title: "A Fé que Move Montanhas",
    content: "Jesus nos ensinou que a fé, mesmo que pequena como um grão de mostarda, tem poder para mover montanhas. Não é o tamanho da nossa fé que importa, mas em quem depositamos essa fé. Deus é capaz de fazer infinitamente mais do que tudo o que pedimos ou pensamos. Hoje, independente das circunstâncias que você enfrenta, lembre-se: com Deus, todas as coisas são possíveis.",
    verseReference: "Mateus 17:20",
    verseText: "Porque em verdade vos digo que, se tiverdes fé como um grão de mostarda, direis a este monte: Passa daqui para acolá, e ele passará; e nada vos será impossível.",
    author: "Pastor João",
    publishDate: new Date(),
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "O Descanso em Deus",
    content: "Em meio às turbulências da vida, Jesus nos convida a descansar Nele. Não é um descanso físico apenas, mas um descanso da alma. Quando entregamos nossas preocupações a Ele, encontramos paz que excede todo entendimento. Hoje, pare um momento, respire fundo, e entregue suas ansiedades ao Senhor.",
    verseReference: "Mateus 11:28-30",
    verseText: "Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei. Tomai sobre vós o meu jugo e aprendei de mim, porque sou manso e humilde de coração; e achareis descanso para a vossa alma.",
    author: "Pastor João",
    publishDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    title: "Força na Fraqueza",
    content: "Paulo aprendeu que nas nossas fraquezas a graça de Deus se manifesta de forma poderosa. Quando reconhecemos nossa limitação, abrimos espaço para Deus agir. Não tenha vergonha das suas fragilidades, pois é exatamente ali que o poder de Cristo se aperfeiçoa.",
    verseReference: "2 Coríntios 12:9",
    verseText: "E disse-me: A minha graça te basta, porque o meu poder se aperfeiçoa na fraqueza.",
    author: "Líder Maria",
    publishDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

interface CartaoDevocionalProps {
  devocional: Devocional;
  expandido?: boolean;
  aoExpandir: () => void;
}

function CartaoDevocional({ devocional, expandido, aoExpandir }: CartaoDevocionalProps) {
  const [favorito, setFavorito] = useState(false);
  const ehHoje = new Date().toDateString() === devocional.publishDate.toDateString();

  const compartilhar = () => {
    const text = `📖 ${devocional.title}\n\n${devocional.content}\n\n"${devocional.verseText}" - ${devocional.verseReference}\n\n— Devocional Semear`;
    
    if (navigator.share) {
      navigator.share({ title: devocional.title, text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-200",
      ehHoje && "border-gold bg-gold/5",
      expandido && "shadow-lg"
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {ehHoje && (
                  <Badge className="bg-gold text-gold-foreground border-0">
                    Hoje
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {devocional.publishDate.toLocaleDateString("pt-BR")}
                </span>
              </div>
              <h3 className="text-lg font-semibold">{devocional.title}</h3>
              <p className="text-xs text-muted-foreground">Por {devocional.author}</p>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setFavorito(!favorito)}
              >
                <Star className={cn(
                  "h-4 w-4",
                  favorito && "fill-gold text-gold"
                )} />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={compartilhar}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Verse */}
          <div className="verse-highlight">
            <p className="text-sm italic">"{devocional.verseText}"</p>
            <p className="text-xs font-semibold text-olive mt-1">
              — {devocional.verseReference}
            </p>
          </div>

          {/* Content */}
          <p className={cn(
            "text-sm text-muted-foreground",
            !expandido && "line-clamp-3"
          )}>
            {devocional.content}
          </p>

          {!expandido && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-olive hover:text-olive-dark"
              onClick={aoExpandir}
            >
              Ler mais
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          )}

          {/* Reactions */}
          <div className="flex items-center gap-3 pt-2 border-t">
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              <Heart className="h-4 w-4" />
              Amém
            </Button>
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              🙏 Orar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaginaDevocionais() {
  const [buscaTexto, setBuscaTexto] = useState("");
  const [devocionais] = useState<Devocional[]>(devocionaisExemplo);
  const [idExpandido, setIdExpandido] = useState<string | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);

  const devocionaisFiltrados = devocionais.filter((d) =>
    d.title.toLowerCase().includes(buscaTexto.toLowerCase()) ||
    d.content.toLowerCase().includes(buscaTexto.toLowerCase())
  );

  return (
    <LayoutApp>
      <div className="space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-deep-blue text-deep-blue-foreground">
              <BookMarked className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Devocionais</h1>
              <p className="text-sm text-muted-foreground">
                Alimento diário para sua alma
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
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Novo Devocional</DialogTitle>
                <DialogDescription>
                  Escreva um devocional para edificar a igreja.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input id="title" placeholder="Título do devocional" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="verseRef">Versículo Base *</Label>
                    <Input id="verseRef" placeholder="Ex: João 3:16" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="publishDate">Data de publicação</Label>
                    <Input id="publishDate" type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verseText">Texto do Versículo *</Label>
                  <Textarea id="verseText" placeholder="Digite o versículo..." rows={2} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo do Devocional *</Label>
                  <Textarea id="content" placeholder="Escreva a reflexão..." rows={6} />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogAberto(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setDialogAberto(false)}>
                    Publicar
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
            placeholder="Buscar devocionais..."
            className="pl-10"
            value={buscaTexto}
            onChange={(e) => setBuscaTexto(e.target.value)}
          />
        </div>

        {/* Lista de devocionais */}
        <div className="space-y-4">
          {devocionaisFiltrados.map((devocional) => (
            <CartaoDevocional
              key={devocional.id}
              devocional={devocional}
              expandido={idExpandido === devocional.id}
              aoExpandir={() => setIdExpandido(idExpandido === devocional.id ? null : devocional.id)}
            />
          ))}

          {devocionaisFiltrados.length === 0 && (
            <div className="text-center py-12">
              <BookMarked className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Nenhum devocional encontrado
              </p>
            </div>
          )}
        </div>
      </div>
    </LayoutApp>
  );
}
