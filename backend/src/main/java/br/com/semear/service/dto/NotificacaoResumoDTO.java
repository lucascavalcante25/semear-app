package br.com.semear.service.dto;

import br.com.semear.service.NotificacaoService.NotificacaoItem;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class NotificacaoResumoDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private List<NotificacaoItem> notificacoes = new ArrayList<>();
    private int preCadastrosPendentes;
    private int pedidosOracaoPendentes;

    public List<NotificacaoItem> getNotificacoes() {
        return notificacoes;
    }

    public void setNotificacoes(List<NotificacaoItem> notificacoes) {
        this.notificacoes = notificacoes != null ? notificacoes : new ArrayList<>();
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
}
