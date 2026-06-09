import { useEffect, useState } from "react";
import { LayoutSuperAdmin } from "@/components/layout/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { listarUsuariosAdmin, type AdminUsuario } from "@/modules/admin/api";

export default function UsuariosSuperAdmin() {
  const [usuarios, setUsuarios] = useState<AdminUsuario[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      try {
        setUsuarios(await listarUsuariosAdmin());
      } catch {
        setUsuarios([]);
      } finally {
        setCarregando(false);
      }
    };
    void carregar();
  }, []);

  const filtrados = usuarios.filter((u) => {
    const termo = busca.toLowerCase();
    const nome = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
    return (
      u.login.toLowerCase().includes(termo) ||
      (u.email || "").toLowerCase().includes(termo) ||
      nome.includes(termo) ||
      (u.igrejaNome || "").toLowerCase().includes(termo)
    );
  });

  return (
    <LayoutSuperAdmin>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">Todos os usuários cadastrados na plataforma.</p>
        </div>
        <Input
          placeholder="Buscar por nome, e-mail ou igreja..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="max-w-md"
        />
        {carregando ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : (
          <div className="grid gap-3">
            {filtrados.map((u) => (
              <Card key={u.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">
                      {u.firstName || u.lastName
                        ? `${u.firstName || ""} ${u.lastName || ""}`.trim()
                        : u.login}
                    </CardTitle>
                    <Badge variant={u.activated ? "default" : "secondary"}>
                      {u.activated ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p>{u.email || u.login}</p>
                  <p>Igreja: {u.igrejaNome || "—"}</p>
                  <p className="text-xs">
                    Perfis: {(u.authorities || []).join(", ") || "—"}
                  </p>
                </CardContent>
              </Card>
            ))}
            {filtrados.length === 0 && (
              <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
            )}
          </div>
        )}
      </div>
    </LayoutSuperAdmin>
  );
}
