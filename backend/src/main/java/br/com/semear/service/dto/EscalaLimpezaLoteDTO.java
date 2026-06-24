package br.com.semear.service.dto;

import java.io.Serializable;

public class EscalaLimpezaLoteDTO implements Serializable {

    private String chave;
    private Long geracaoId;
    private String criadoEm;
    private String modo;
    private Integer totalEscalas;
    private String cicloPeriodo;

    public String getChave() {
        return chave;
    }

    public void setChave(String chave) {
        this.chave = chave;
    }

    public Long getGeracaoId() {
        return geracaoId;
    }

    public void setGeracaoId(Long geracaoId) {
        this.geracaoId = geracaoId;
    }

    public String getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(String criadoEm) {
        this.criadoEm = criadoEm;
    }

    public String getModo() {
        return modo;
    }

    public void setModo(String modo) {
        this.modo = modo;
    }

    public Integer getTotalEscalas() {
        return totalEscalas;
    }

    public void setTotalEscalas(Integer totalEscalas) {
        this.totalEscalas = totalEscalas;
    }

    public String getCicloPeriodo() {
        return cicloPeriodo;
    }

    public void setCicloPeriodo(String cicloPeriodo) {
        this.cicloPeriodo = cicloPeriodo;
    }
}
