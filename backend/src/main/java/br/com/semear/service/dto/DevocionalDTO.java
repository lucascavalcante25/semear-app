package br.com.semear.service.dto;

import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import jakarta.validation.constraints.NotNull;

/**
 * A DTO for the Devocional entity.
 */
public class DevocionalDTO implements Serializable {

    private Long id;

    @NotNull
    private String titulo;

    @NotNull
    private String versiculoBase;

    @NotNull
    private String textoVersiculo;

    @NotNull
    private String conteudo;

    @NotNull
    private LocalDate dataPublicacao;

    private Instant createdAt;

    private Instant updatedAt;

    public DevocionalDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getVersiculoBase() {
        return versiculoBase;
    }

    public void setVersiculoBase(String versiculoBase) {
        this.versiculoBase = versiculoBase;
    }

    public String getTextoVersiculo() {
        return textoVersiculo;
    }

    public void setTextoVersiculo(String textoVersiculo) {
        this.textoVersiculo = textoVersiculo;
    }

    public String getConteudo() {
        return conteudo;
    }

    public void setConteudo(String conteudo) {
        this.conteudo = conteudo;
    }

    public LocalDate getDataPublicacao() {
        return dataPublicacao;
    }

    public void setDataPublicacao(LocalDate dataPublicacao) {
        this.dataPublicacao = dataPublicacao;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
