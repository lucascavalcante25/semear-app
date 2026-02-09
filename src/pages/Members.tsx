import { useState } from "react";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail,
  MoreVertical,
  Edit,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Membro } from "@/types";

// Membros de exemplo
const membrosExemplo: Membro[] = [
  {
    id: "1",
    name: "Maria Santos da Silva",
    email: "maria@email.com",
    phone: "(11) 99999-1234",
    birthDate: new Date("1985-03-15"),
    ministry: "Louvor",
    role: "Líder",
    maritalStatus: "married",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "João Pedro Oliveira",
    email: "joao@email.com",
    phone: "(11) 98888-5678",
    birthDate: new Date("1990-07-22"),
    ministry: "Diaconia",
    role: "Diácono",
    maritalStatus: "single",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Ana Paula Costa",
    email: "ana@email.com",
    phone: "(11) 97777-9012",
    birthDate: new Date("1978-11-08"),
    ministry: "Infantil",
    role: "Professora",
    maritalStatus: "married",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function obterIniciais(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface CartaoMembroProps {
  membro: Membro;
  aoEditar: (membro: Membro) => void;
  aoExcluir: (id: string) => void;
}

function CartaoMembro({ membro, aoEditar, aoExcluir }: CartaoMembroProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={membro.photoUrl} alt={membro.name} />
            <AvatarFallback className="bg-olive-light text-olive-dark font-medium">
              {obterIniciais(membro.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold truncate">{membro.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  {membro.ministry && (
                    <Badge variant="secondary" className="text-xs">
                      {membro.ministry}
                    </Badge>
                  )}
                  {membro.role && (
                    <span className="text-xs text-muted-foreground">
                      {membro.role}
                    </span>
                  )}
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => aoEditar(membro)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => aoExcluir(membro.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
              <a href={`tel:${membro.phone}`} className="flex items-center gap-1.5 hover:text-foreground">
                <Phone className="h-3.5 w-3.5" />
                {membro.phone}
              </a>
              {membro.email && (
                <a href={`mailto:${membro.email}`} className="flex items-center gap-1.5 hover:text-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {membro.email}
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Membros() {
  const [buscaTexto, setBuscaTexto] = useState("");
  const [membros] = useState<Membro[]>(membrosExemplo);
  const [dialogAberto, setDialogAberto] = useState(false);

  const membrosFiltrados = membros.filter((membro) =>
    membro.name.toLowerCase().includes(buscaTexto.toLowerCase()) ||
    membro.ministry?.toLowerCase().includes(buscaTexto.toLowerCase())
  );

  const editarMembro = (membro: Membro) => {
    console.log("Editar membro:", membro);
  };

  const excluirMembro = (id: string) => {
    console.log("Excluir membro:", id);
  };

  return (
    <LayoutApp>
      <div className="space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-olive text-olive-foreground">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Membros</h1>
              <p className="text-sm text-muted-foreground">
                {membros.length} membros cadastrados
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
                <DialogTitle>Novo Membro</DialogTitle>
                <DialogDescription>
                  Preencha os dados para cadastrar um novo membro.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input id="name" placeholder="Nome do membro" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input id="phone" placeholder="(00) 00000-0000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" placeholder="email@exemplo.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de nascimento</Label>
                    <Input id="birthDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maritalStatus">Estado civil</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Solteiro(a)</SelectItem>
                        <SelectItem value="married">Casado(a)</SelectItem>
                        <SelectItem value="widowed">Viúvo(a)</SelectItem>
                        <SelectItem value="divorced">Divorciado(a)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ministry">Ministério</Label>
                    <Input id="ministry" placeholder="Ex: Louvor" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Cargo</Label>
                    <Input id="role" placeholder="Ex: Líder" />
                  </div>
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
            placeholder="Buscar por nome ou ministério..."
            className="pl-10"
            value={buscaTexto}
            onChange={(e) => setBuscaTexto(e.target.value)}
          />
        </div>

        {/* Members List */}
        <div className="space-y-3">
          {membrosFiltrados.map((membro) => (
            <CartaoMembro
              key={membro.id}
              membro={membro}
              aoEditar={editarMembro}
              aoExcluir={excluirMembro}
            />
          ))}

          {membrosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Nenhum membro encontrado
              </p>
            </div>
          )}
        </div>
      </div>
    </LayoutApp>
  );
}
