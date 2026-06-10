package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.StatusAssinatura;
import java.io.Serializable;
import java.time.LocalDate;

public class AssinaturaAcessoDTO implements Serializable {

    private Long igrejaId;
    private StatusAssinatura statusAssinatura;
    private Integer diasRestantesTeste;
    private LocalDate dataFimTeste;
    private boolean acessoPermitido;
    private String mensagem;

    public Long getIgrejaId() {
        return igrejaId;
    }

    public void setIgrejaId(Long igrejaId) {
        this.igrejaId = igrejaId;
    }

    public StatusAssinatura getStatusAssinatura() {
        return statusAssinatura;
    }

    public void setStatusAssinatura(StatusAssinatura statusAssinatura) {
        this.statusAssinatura = statusAssinatura;
    }

    public Integer getDiasRestantesTeste() {
        return diasRestantesTeste;
    }

    public void setDiasRestantesTeste(Integer diasRestantesTeste) {
        this.diasRestantesTeste = diasRestantesTeste;
    }

    public LocalDate getDataFimTeste() {
        return dataFimTeste;
    }

    public void setDataFimTeste(LocalDate dataFimTeste) {
        this.dataFimTeste = dataFimTeste;
    }

    public boolean isAcessoPermitido() {
        return acessoPermitido;
    }

    public void setAcessoPermitido(boolean acessoPermitido) {
        this.acessoPermitido = acessoPermitido;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }
}
