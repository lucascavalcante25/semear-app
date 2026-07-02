package br.com.semear.service.dto;

import java.io.Serializable;
import java.time.Instant;
import java.util.List;

public class LouvorCifraApiDTO implements Serializable {

    private List<String> linhas;
    private String url;
    private String fonte;
    private boolean doCache;
    private boolean disponivel;
    private String mensagem;
    private Instant cacheEm;

    public List<String> getLinhas() {
        return linhas;
    }

    public void setLinhas(List<String> linhas) {
        this.linhas = linhas;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getFonte() {
        return fonte;
    }

    public void setFonte(String fonte) {
        this.fonte = fonte;
    }

    public boolean isDoCache() {
        return doCache;
    }

    public void setDoCache(boolean doCache) {
        this.doCache = doCache;
    }

    public boolean isDisponivel() {
        return disponivel;
    }

    public void setDisponivel(boolean disponivel) {
        this.disponivel = disponivel;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }

    public Instant getCacheEm() {
        return cacheEm;
    }

    public void setCacheEm(Instant cacheEm) {
        this.cacheEm = cacheEm;
    }
}
