package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.StatusSolicitacaoSuporte;
import java.io.Serializable;

public class ResponderSolicitacaoSuporteDTO implements Serializable {

    private String respostaAdmin;
    private StatusSolicitacaoSuporte status;
    private String observacaoInternaAdmin;

    public String getRespostaAdmin() {
        return respostaAdmin;
    }

    public void setRespostaAdmin(String respostaAdmin) {
        this.respostaAdmin = respostaAdmin;
    }

    public StatusSolicitacaoSuporte getStatus() {
        return status;
    }

    public void setStatus(StatusSolicitacaoSuporte status) {
        this.status = status;
    }

    public String getObservacaoInternaAdmin() {
        return observacaoInternaAdmin;
    }

    public void setObservacaoInternaAdmin(String observacaoInternaAdmin) {
        this.observacaoInternaAdmin = observacaoInternaAdmin;
    }
}
