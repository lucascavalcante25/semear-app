package br.com.semear.service.dto;

import java.io.Serializable;
import java.time.Instant;

public class SolicitacaoSuporteAnexoDTO implements Serializable {

    private Long id;
    private String nomeArquivo;
    private String tipoArquivo;
    private Long tamanhoArquivo;
    private Instant dataUpload;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomeArquivo() {
        return nomeArquivo;
    }

    public void setNomeArquivo(String nomeArquivo) {
        this.nomeArquivo = nomeArquivo;
    }

    public String getTipoArquivo() {
        return tipoArquivo;
    }

    public void setTipoArquivo(String tipoArquivo) {
        this.tipoArquivo = tipoArquivo;
    }

    public Long getTamanhoArquivo() {
        return tamanhoArquivo;
    }

    public void setTamanhoArquivo(Long tamanhoArquivo) {
        this.tamanhoArquivo = tamanhoArquivo;
    }

    public Instant getDataUpload() {
        return dataUpload;
    }

    public void setDataUpload(Instant dataUpload) {
        this.dataUpload = dataUpload;
    }
}
