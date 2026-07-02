import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { listarArtistasLouvor } from "@/modules/louvores/api";

type Props = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  ativo?: boolean;
};

export function CampoArtistaLouvor({
  value,
  onChange,
  id = "artist",
  disabled,
  placeholder = "Ex: Hillsong",
  ativo = true,
}: Props) {
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const datalistId = `${id}-datalist`;

  useEffect(() => {
    if (!ativo) return;
    let cancelled = false;
    listarArtistasLouvor()
      .then((lista) => {
        if (!cancelled) setSugestoes(lista);
      })
      .catch(() => {
        if (!cancelled) setSugestoes([]);
      });
    return () => {
      cancelled = true;
    };
  }, [ativo]);

  const sugestoesVisiveis = useMemo(() => {
    const termo = value.trim().toLowerCase();
    if (!termo) return sugestoes;
    return sugestoes.filter((nome) => nome.toLowerCase().includes(termo));
  }, [sugestoes, value]);

  return (
    <>
      <Input
        id={id}
        list={datalistId}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoComplete="off"
      />
      <datalist id={datalistId}>
        {sugestoesVisiveis.map((nome) => (
          <option key={nome} value={nome} />
        ))}
      </datalist>
    </>
  );
}
