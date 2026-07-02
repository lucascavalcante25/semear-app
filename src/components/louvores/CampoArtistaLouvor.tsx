import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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
  const [aberto, setAberto] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const carregarSugestoes = useCallback(async (termo: string) => {
    if (!ativo) return;
    try {
      const lista = await listarArtistasLouvor(termo.trim() || undefined);
      setSugestoes(lista);
    } catch {
      setSugestoes([]);
    }
  }, [ativo]);

  useEffect(() => {
    if (!ativo || !aberto) return;
    const timer = window.setTimeout(() => {
      void carregarSugestoes(value);
    }, 150);
    return () => window.clearTimeout(timer);
  }, [ativo, aberto, value, carregarSugestoes]);

  useEffect(() => {
    if (!aberto) return;
    const aoClicarFora = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setAberto(false);
        setIndiceAtivo(-1);
      }
    };
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, [aberto]);

  const sugestoesVisiveis = useMemo(() => {
    const termo = value.trim().toLowerCase();
    const lista = termo
      ? sugestoes.filter((nome) => nome.toLowerCase().includes(termo))
      : sugestoes;
    const unicos = Array.from(new Set(lista));
    return unicos.slice(0, 12);
  }, [sugestoes, value]);

  const selecionar = (nome: string) => {
    onChange(nome);
    setAberto(false);
    setIndiceAtivo(-1);
  };

  const mostrarLista = aberto && sugestoesVisiveis.length > 0 && !disabled;

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        name={`semear-artista-louvor-${id}`}
        data-1p-ignore
        data-lpignore="true"
        role="combobox"
        aria-expanded={mostrarLista}
        aria-controls={listboxId}
        aria-autocomplete="list"
        onFocus={() => {
          setAberto(true);
          void carregarSugestoes(value);
        }}
        onChange={(e) => {
          onChange(e.target.value);
          setAberto(true);
          setIndiceAtivo(-1);
        }}
        onKeyDown={(e) => {
          if (!mostrarLista) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setIndiceAtivo((atual) => Math.min(atual + 1, sugestoesVisiveis.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setIndiceAtivo((atual) => Math.max(atual - 1, 0));
          } else if (e.key === "Enter" && indiceAtivo >= 0) {
            e.preventDefault();
            selecionar(sugestoesVisiveis[indiceAtivo]!);
          } else if (e.key === "Escape") {
            setAberto(false);
            setIndiceAtivo(-1);
          }
        }}
      />

      {mostrarLista && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-popover py-1 text-popover-foreground shadow-md"
        >
          {sugestoesVisiveis.map((nome, idx) => (
            <li key={nome} role="option" aria-selected={idx === indiceAtivo}>
              <button
                type="button"
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                  idx === indiceAtivo && "bg-accent text-accent-foreground",
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selecionar(nome);
                }}
              >
                {nome}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
