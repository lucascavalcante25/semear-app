package br.com.semear.service.dto;

import java.io.Serializable;
import java.time.Instant;
import java.util.List;

public class LouvorLetraDTO implements Serializable {

    private String texto;
    private String fonte;
    private boolean doCache;
    private boolean disponivel;
    private String mensagem;
    private Instant cacheEm;

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
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
