package br.com.semear.repository.projection;

import br.com.semear.domain.enumeration.TipoLouvor;
import java.time.Instant;

/**
 * Projeção leve para listagem de louvores — evita carregar colunas TEXT (letra/cifra/observações).
 */
public interface LouvorListagemProjection {
    Long getId();

    String getTitulo();

    String getArtista();

    String getTonalidade();

    String getTempo();

    TipoLouvor getTipo();

    String getYoutubeUrl();

    Boolean getAtivo();

    Boolean getTemLetraSalva();

    Boolean getTemCifraApiSalva();

    Instant getCreatedAt();

    Instant getUpdatedAt();
}
