package br.com.semear.service.dto;

import jakarta.validation.constraints.NotBlank;

public class LouvorSalvarCifraDTO {

    @NotBlank
    private String texto;

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }
}
