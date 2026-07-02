package br.com.semear.service.dto;

import java.io.Serializable;

public class NotificacaoContagemDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private int totalNotificacoes;
    private int preCadastrosPendentes;
    private int pedidosOracaoPendentes;
    private String fingerprint;

    public int getTotalNotificacoes() {
        return totalNotificacoes;
    }

    public void setTotalNotificacoes(int totalNotificacoes) {
        this.totalNotificacoes = totalNotificacoes;
    }

    public int getPreCadastrosPendentes() {
        return preCadastrosPendentes;
    }

    public void setPreCadastrosPendentes(int preCadastrosPendentes) {
        this.preCadastrosPendentes = preCadastrosPendentes;
    }

    public int getPedidosOracaoPendentes() {
        return pedidosOracaoPendentes;
    }

    public void setPedidosOracaoPendentes(int pedidosOracaoPendentes) {
        this.pedidosOracaoPendentes = pedidosOracaoPendentes;
    }

    public String getFingerprint() {
        return fingerprint;
    }

    public void setFingerprint(String fingerprint) {
        this.fingerprint = fingerprint;
    }
}
