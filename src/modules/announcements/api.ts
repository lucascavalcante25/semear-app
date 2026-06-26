export {
  type ComunicadoDTO as AvisoDTO,
  type ComunicadoApp as AvisoApp,
  type TipoComunicadoApi as TipoAvisoApi,
  mapearComunicado as mapearAviso,
  listarComunicados as listarAvisos,
  criarComunicado as criarAviso,
  atualizarComunicado as atualizarAviso,
  excluirComunicado as excluirAviso,
  mapTipoToApi as tipoUiParaApi,
} from "@/modules/comunicados/api";
