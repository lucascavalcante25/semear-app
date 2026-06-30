package br.com.semear.service.dto;

import java.io.Serializable;

public class AdminMenuResumoDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private int solicitacoesPendentes;
    private int suporteAguardandoResposta;

    public int getSolicitacoesPendentes() {
        return solicitacoesPendentes;
    }

    public void setSolicitacoesPendentes(int solicitacoesPendentes) {
        this.solicitacoesPendentes = solicitacoesPendentes;
    }

    public int getSuporteAguardandoResposta() {
        return suporteAguardandoResposta;
    }

    public void setSuporteAguardandoResposta(int suporteAguardandoResposta) {
        this.suporteAguardandoResposta = suporteAguardandoResposta;
    }
}
