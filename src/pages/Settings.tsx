import { useState, useEffect, useRef } from "react";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarCropperModal } from "@/components/avatar/AvatarCropperModal";
import { Settings as SettingsIcon, Camera, Loader2, Search } from "lucide-react";
import { usarAutenticacao } from "@/contexts/AuthContext";
import {
  obterConta,
  atualizarConta,
  uploadAvatar,
  type ContaDTO,
} from "@/modules/account/api";
import { useAvatarUrlCurrentUser } from "@/hooks/use-avatar-url";
import { formatarTelefone, telefoneApenasDigitos, formatarCep, cepApenasDigitos } from "@/lib/masks";
import { buscarCep } from "@/modules/viacep/api";
import { toast } from "sonner";

export default function Settings() {
  const { user } = usarAutenticacao();
  const avatarUrl = useAvatarUrlCurrentUser();
  const [conta, setConta] = useState<ContaDTO | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [enviandoAvatar, setEnviandoAvatar] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    phoneSecondary: "",
    phoneEmergency: "",
    nomeContatoEmergencia: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
  });

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      try {
        const dados = await obterConta();
        setConta(dados);
        setForm({
          firstName: dados.firstName ?? "",
          lastName: dados.lastName ?? "",
          email: dados.email ?? "",
          phone: formatarTelefone(dados.phone ?? ""),
          phoneSecondary: formatarTelefone(dados.phoneSecondary ?? ""),
          phoneEmergency: formatarTelefone(dados.phoneEmergency ?? ""),
          nomeContatoEmergencia: dados.nomeContatoEmergencia ?? "",
          logradouro: dados.logradouro ?? "",
          numero: dados.numero ?? "",
          complemento: dados.complemento ?? "",
          bairro: dados.bairro ?? "",
          cidade: dados.cidade ?? "",
          estado: dados.estado ?? "",
          cep: formatarCep(dados.cep ?? ""),
        });
      } catch {
        toast.error("Não foi possível carregar seus dados.");
      } finally {
        setCarregando(false);
      }
    };
    void carregar();
  }, []);

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      await atualizarConta({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: telefoneApenasDigitos(form.phone).trim() || null,
        phoneSecondary: telefoneApenasDigitos(form.phoneSecondary).trim() || null,
        phoneEmergency: telefoneApenasDigitos(form.phoneEmergency).trim() || null,
        nomeContatoEmergencia: form.nomeContatoEmergencia.trim() || null,
        logradouro: form.logradouro.trim() || null,
        numero: form.numero.trim() || null,
        complemento: form.complemento.trim() || null,
        bairro: form.bairro.trim() || null,
        cidade: form.cidade.trim() || null,
        estado: form.estado.trim().toUpperCase().slice(0, 2) || null,
        cep: cepApenasDigitos(form.cep).slice(0, 8) || null,
      });
      toast.success("Dados atualizados com sucesso.");
      const dados = await obterConta();
      setConta(dados);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao salvar.";
      toast.error(msg);
    } finally {
      setSalvando(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Formato não permitido. Use JPEG, PNG, GIF ou WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5 MB para edição.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropConfirm = async (file: File) => {
    setEnviandoAvatar(true);
    try {
      await uploadAvatar(file);
      toast.success("Foto atualizada com sucesso.");
      setImageToCrop(null);
      window.location.reload();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao enviar foto.";
      toast.error(msg);
    } finally {
      setEnviandoAvatar(false);
    }
  };

  const handleBuscarCep = async () => {
    const digits = cepApenasDigitos(form.cep);
    if (digits.length !== 8) {
      toast.error("Informe um CEP válido com 8 dígitos.");
      return;
    }
    setBuscandoCep(true);
    try {
      const end = await buscarCep(digits);
      if (end) {
        setForm((f) => ({
          ...f,
          logradouro: end.logradouro ?? f.logradouro,
          bairro: end.bairro ?? f.bairro,
          cidade: end.localidade ?? f.cidade,
          estado: end.uf ?? f.estado,
        }));
        toast.success("Endereço encontrado.");
      } else {
        toast.error("CEP não encontrado.");
      }
    } catch {
      toast.error("Erro ao buscar CEP.");
    } finally {
      setBuscandoCep(false);
    }
  };

  const iniciais = [form.firstName, form.lastName]
    .filter(Boolean)
    .map((s) => s.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2) || user?.name?.slice(0, 2).toUpperCase();

  return (
    <LayoutApp>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-6 w-6" />
            Configurações
          </h1>
          <p className="text-sm text-muted-foreground">
            Edite seus dados pessoais e foto de perfil
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Foto de perfil</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="relative group">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl ?? undefined} alt={user?.name} />
                <AvatarFallback className="bg-olive-light text-olive-dark text-2xl">
                  {iniciais || "?"}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={enviandoAvatar}
              >
                {enviandoAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Clique no ícone para trocar a foto. Você poderá ajustar o enquadramento antes de salvar.
            </p>
          </CardContent>
        </Card>

        <AvatarCropperModal
          open={cropperOpen}
          onOpenChange={(open) => {
            setCropperOpen(open);
            if (!open) setImageToCrop(null);
          }}
          imageSrc={imageToCrop}
          onConfirm={handleCropConfirm}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            {carregando ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSalvar();
                }}
                className="space-y-5"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input
                      id="firstName"
                      value={form.firstName}
                      onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                      placeholder="Seu nome"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input
                      id="lastName"
                      value={form.lastName}
                      onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                      placeholder="Seu sobrenome"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone principal</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: formatarTelefone(e.target.value) }))}
                      placeholder="(00) 00000-0000"
                      maxLength={16}
                      className="max-w-[200px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneSecondary">Telefone secundário</Label>
                    <Input
                      id="phoneSecondary"
                      value={form.phoneSecondary}
                      onChange={(e) => setForm((f) => ({ ...f, phoneSecondary: formatarTelefone(e.target.value) }))}
                      placeholder="(00) 00000-0000"
                      maxLength={16}
                      className="max-w-[200px]"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nomeContatoEmergencia">Contato de emergência (nome)</Label>
                    <Input
                      id="nomeContatoEmergencia"
                      value={form.nomeContatoEmergencia}
                      onChange={(e) => setForm((f) => ({ ...f, nomeContatoEmergencia: e.target.value }))}
                      placeholder="Nome da pessoa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneEmergency">Telefone de emergência</Label>
                    <Input
                      id="phoneEmergency"
                      value={form.phoneEmergency}
                      onChange={(e) => setForm((f) => ({ ...f, phoneEmergency: formatarTelefone(e.target.value) }))}
                      placeholder="(00) 00000-0000"
                      maxLength={16}
                      className="max-w-[200px]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cep"
                      value={form.cep}
                      onChange={(e) => setForm((f) => ({ ...f, cep: formatarCep(e.target.value) }))}
                      placeholder="00000-000"
                      maxLength={9}
                      className="w-32"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBuscarCep}
                      disabled={buscandoCep || cepApenasDigitos(form.cep).length !== 8}
                    >
                      {buscandoCep ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4 mr-1" />Buscar</>}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <Input
                    id="logradouro"
                    value={form.logradouro}
                    onChange={(e) => setForm((f) => ({ ...f, logradouro: e.target.value }))}
                    placeholder="Rua, avenida..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero">Nº</Label>
                    <Input
                      id="numero"
                      value={form.numero}
                      onChange={(e) => setForm((f) => ({ ...f, numero: e.target.value }))}
                      placeholder="Nº"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      value={form.complemento}
                      onChange={(e) => setForm((f) => ({ ...f, complemento: e.target.value }))}
                      placeholder="Apto, bloco..."
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={form.bairro}
                      onChange={(e) => setForm((f) => ({ ...f, bairro: e.target.value }))}
                      placeholder="Bairro"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={form.cidade}
                      onChange={(e) => setForm((f) => ({ ...f, cidade: e.target.value }))}
                      placeholder="Cidade"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">UF</Label>
                    <Input
                      id="estado"
                      value={form.estado}
                      onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value.toUpperCase().slice(0, 2) }))}
                      placeholder="SP"
                      maxLength={2}
                      className="w-16"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={salvando} className="w-full">
                  {salvando ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Salvar alterações
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </LayoutApp>
  );
}
