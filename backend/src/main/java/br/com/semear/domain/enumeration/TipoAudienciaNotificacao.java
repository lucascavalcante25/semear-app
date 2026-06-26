package br.com.semear.domain.enumeration;

/** Público-alvo configurável para notificações de eventos e comunicados. */
public enum TipoAudienciaNotificacao {
    /** Todos os membros ativos da igreja. */
    TODOS,
    /** Apenas inscritos ativos no evento (somente eventos). */
    INSCRITOS,
    /** Membros de um ou mais departamentos selecionados. */
    DEPARTAMENTOS,
    /** Membros com sexo masculino cadastrado. */
    HOMENS,
    /** Membros com sexo feminino cadastrado. */
    MULHERES,
}
