package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.TipoLouvor;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;

public class LouvorDTO implements Serializable {

    private Long id;

    @NotNull
    private String titulo;

    @NotNull
    private String artista;

    private String tonalidade;
    private String tempo;

    @NotNull
    private TipoLouvor tipo;

    private String youtubeUrl;
    private String cifraUrl;
    private String cifraConteudo;
    private String cifraFileName;
    private String cifraContentType;
    private String observacoes;
    private Boolean ativo = true;
    private Instant createdAt;
    private Instant updatedAt;

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

    public String getArtista() {
        return artista;
    }

    public void setArtista(String artista) {
        this.artista = artista;
    }

    public String getTonalidade() {
        return tonalidade;
    }

    public void setTonalidade(String tonalidade) {
        this.tonalidade = tonalidade;
    }

    public String getTempo() {
        return tempo;
    }

    public void setTempo(String tempo) {
        this.tempo = tempo;
    }

    public TipoLouvor getTipo() {
        return tipo;
    }

    public void setTipo(TipoLouvor tipo) {
        this.tipo = tipo;
    }

    public String getYoutubeUrl() {
        return youtubeUrl;
    }

    public void setYoutubeUrl(String youtubeUrl) {
        this.youtubeUrl = youtubeUrl;
    }

    public String getCifraUrl() {
        return cifraUrl;
    }

    public void setCifraUrl(String cifraUrl) {
        this.cifraUrl = cifraUrl;
    }

    public String getCifraConteudo() {
        return cifraConteudo;
    }

    public void setCifraConteudo(String cifraConteudo) {
        this.cifraConteudo = cifraConteudo;
    }

    public String getCifraFileName() {
        return cifraFileName;
    }

    public void setCifraFileName(String cifraFileName) {
        this.cifraFileName = cifraFileName;
    }

    public String getCifraContentType() {
        return cifraContentType;
    }

    public void setCifraContentType(String cifraContentType) {
        this.cifraContentType = cifraContentType;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
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
