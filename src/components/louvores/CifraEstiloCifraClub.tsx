import { agruparEstrofes, colorirAcordesNaLinha, segmentarLinhaCifra } from "@/lib/cifra-linhas";
import { cn } from "@/lib/utils";

export const COR_ACORDE_CIFRA = "#ff7e21";
export const COR_LETRA_CIFRA = "#f3f3f3";

type Props = {
  linhas: string[];
  tamanhoFonte: number;
  duasColunas?: boolean;
};

function LinhaCifra({ linha }: { linha: string }) {
  if (!linha) return <span>{"\u00A0"}</span>;
  if (!colorirAcordesNaLinha(linha)) {
    return <span className="text-[#f3f3f3]">{linha}</span>;
  }
  return (
    <>
      {segmentarLinhaCifra(linha).map((seg, i) => (
        <span
          key={i}
          style={seg.acorde ? { color: COR_ACORDE_CIFRA, fontWeight: 700 } : undefined}
          className={seg.acorde ? undefined : "text-[#f3f3f3]"}
        >
          {seg.texto}
        </span>
      ))}
    </>
  );
}

export function CifraEstiloCifraClub({ linhas, tamanhoFonte, duasColunas }: Props) {
  const estrofes = agruparEstrofes(linhas);

  return (
    <div
      className={cn(
        "w-full max-w-full font-mono",
        duasColunas && "md:columns-2 md:gap-x-12 lg:gap-x-16",
      )}
      style={{ fontSize: `${tamanhoFonte}px`, tabSize: 4, lineHeight: 1.65 }}
    >
      {estrofes.map((estrofe, ei) => (
        <div key={ei} className="mb-5 break-inside-avoid md:mb-6">
          <pre className="m-0 overflow-visible whitespace-pre font-mono leading-[inherit]">
            {estrofe.map((linha, li) => (
              <span key={li}>
                {li > 0 ? "\n" : null}
                <LinhaCifra linha={linha} />
              </span>
            ))}
          </pre>
        </div>
      ))}
    </div>
  );
}
