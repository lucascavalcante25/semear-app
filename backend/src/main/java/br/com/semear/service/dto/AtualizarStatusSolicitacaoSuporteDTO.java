package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.PrioridadeSolicitacaoSuporte;
import br.com.semear.domain.enumeration.StatusSolicitacaoSuporte;
import java.io.Serializable;

public class AtualizarStatusSolicitacaoSuporteDTO implements Serializable {

    private StatusSolicitacaoSuporte status;
    private PrioridadeSolicitacaoSuporte prioridade;
    private String observacaoInternaAdmin;

    public StatusSolicitacaoSuporte getStatus() {
        return status;
    }

    public void setStatus(StatusSolicitacaoSuporte status) {
        this.status = status;
    }

    public PrioridadeSolicitacaoSuporte getPrioridade() {
        return prioridade;
    }

    public void setPrioridade(PrioridadeSolicitacaoSuporte prioridade) {
        this.prioridade = prioridade;
    }

    public String getObservacaoInternaAdmin() {
        return observacaoInternaAdmin;
    }

    public void setObservacaoInternaAdmin(String observacaoInternaAdmin) {
        this.observacaoInternaAdmin = observacaoInternaAdmin;
    }
}
