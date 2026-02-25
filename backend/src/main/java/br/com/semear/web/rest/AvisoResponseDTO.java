package br.com.semear.web.rest;

import br.com.semear.domain.Aviso;
import br.com.semear.domain.enumeration.TipoAviso;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.time.LocalDate;

/**
 * DTO para resposta de aviso, com criadoPor resolvido para nome completo
 * quando o valor armazenado for CPF (login).
 */
public record AvisoResponseDTO(
    Long id,
    String titulo,
    String conteudo,
    TipoAviso tipo,
    LocalDate dataInicio,
    LocalDate dataFim,
    Boolean ativo,
    Instant criadoEm,
    @JsonProperty("criadoPor") String criadoPorDisplayName,
    Instant atualizadoEm,
    String atualizadoPor
) {
    public static AvisoResponseDTO from(Aviso aviso, String criadoPorDisplayName) {
        return new AvisoResponseDTO(
            aviso.getId(),
            aviso.getTitulo(),
            aviso.getConteudo(),
            aviso.getTipo(),
            aviso.getDataInicio(),
            aviso.getDataFim(),
            aviso.getAtivo(),
            aviso.getCriadoEm(),
            criadoPorDisplayName,
            aviso.getAtualizadoEm(),
            aviso.getAtualizadoPor()
        );
    }
}
