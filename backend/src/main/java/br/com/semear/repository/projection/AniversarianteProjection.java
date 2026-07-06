package br.com.semear.repository.projection;

import java.time.LocalDate;

/**
 * Projeção leve para aniversariantes — evita carregar {@code image_data} (bytea).
 */
public interface AniversarianteProjection {
    Long getId();

    String getFirstName();

    String getLastName();

    String getLogin();

    LocalDate getBirthDate();

    String getImageUrl();
}
