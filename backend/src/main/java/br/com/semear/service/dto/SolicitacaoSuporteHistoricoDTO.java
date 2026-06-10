package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.AcaoSolicitacaoSuporteHistorico;
import br.com.semear.domain.enumeration.StatusSolicitacaoSuporte;
import java.io.Serializable;
import java.time.Instant;

public class SolicitacaoSuporteHistoricoDTO implements Serializable {

    private Long id;
    private AcaoSolicitacaoSuporteHistorico acao;
    private StatusSolicitacaoSuporte statusAnterior;
    private StatusSolicitacaoSuporte statusNovo;
    private String mensagem;
    private Instant dataAcao;
    private String usuarioNome;
    private Boolean visivelParaCliente;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AcaoSolicitacaoSuporteHistorico getAcao() {
        return acao;
    }

    public void setAcao(AcaoSolicitacaoSuporteHistorico acao) {
        this.acao = acao;
    }

    public StatusSolicitacaoSuporte getStatusAnterior() {
        return statusAnterior;
    }

    public void setStatusAnterior(StatusSolicitacaoSuporte statusAnterior) {
        this.statusAnterior = statusAnterior;
    }

    public StatusSolicitacaoSuporte getStatusNovo() {
        return statusNovo;
    }

    public void setStatusNovo(StatusSolicitacaoSuporte statusNovo) {
        this.statusNovo = statusNovo;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }

    public Instant getDataAcao() {
        return dataAcao;
    }

    public void setDataAcao(Instant dataAcao) {
        this.dataAcao = dataAcao;
    }

    public String getUsuarioNome() {
        return usuarioNome;
    }

    public void setUsuarioNome(String usuarioNome) {
        this.usuarioNome = usuarioNome;
    }

    public Boolean getVisivelParaCliente() {
        return visivelParaCliente;
    }

    public void setVisivelParaCliente(Boolean visivelParaCliente) {
        this.visivelParaCliente = visivelParaCliente;
    }
}
