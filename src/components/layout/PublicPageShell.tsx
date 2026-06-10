import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { PLATAFORMA } from "@/lib/plataforma";
import styles from "@/pages/Login.module.css";

type Props = {
  children: React.ReactNode;
  titulo?: string;
  subtitulo?: string;
  voltarPara?: string;
  voltarLabel?: string;
};

export function PublicPageShell({
  children,
  titulo,
  subtitulo,
  voltarPara = "/login",
  voltarLabel = "Voltar ao login",
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    rootRef.current?.scrollTo(0, 0);
  }, []);

  return (
    <div ref={rootRef} className={styles.rootForm}>
      <div className={styles.contentForm}>
        <div className="mb-6 flex items-center justify-between gap-4 w-full">
          <Link
            to={voltarPara}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            {voltarLabel}
          </Link>
          <div className="flex items-center gap-2">
            <img src={PLATAFORMA.logoUrl} alt="" className="h-8 w-8 rounded-lg" aria-hidden />
            <span className="font-semibold text-slate-800">{PLATAFORMA.nome}</span>
          </div>
        </div>

        {(titulo || subtitulo) && (
          <div className="mb-6 text-center w-full">
            {titulo && <h1 className="text-2xl font-bold text-slate-900">{titulo}</h1>}
            {subtitulo && <p className="mt-2 text-sm text-slate-500">{subtitulo}</p>}
          </div>
        )}

        {children}

        <p className={styles.platformFooter}>{PLATAFORMA.nome} · {PLATAFORMA.empresa}</p>
      </div>
    </div>
  );
}
