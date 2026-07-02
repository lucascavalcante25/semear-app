import { useEffect, useState } from "react";
import { listarCargos, type IgrejaCargo } from "@/modules/cargos/api";

export function useCargosIgreja() {
  const [cargos, setCargos] = useState<IgrejaCargo[]>([]);

  useEffect(() => {
    let ativo = true;
    listarCargos()
      .then((lista) => {
        if (ativo) setCargos(lista ?? []);
      })
      .catch(() => {
        if (ativo) setCargos([]);
      });
    return () => {
      ativo = false;
    };
  }, []);

  return cargos;
}
