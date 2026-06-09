package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.StatusSolicitacaoAcesso;
import java.io.Serializable;
import java.time.Instant;

public class SolicitacaoAcessoDTO implements Serializable {

    private Long id;
    private String nomeSolicitante;
    private String email;
    private String telefone;
    private String nomeIgreja;
    private String cnpjIgreja;
    private String cidade;
    private String estado;
    private String mensagem;
    private StatusSolicitacaoAcesso status;
    private Instant dataSolicitacao;
    private Instant dataAnalise;
    private String observacaoAdmin;
    private Long igrejaCriadaId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNomeSolicitante() { return nomeSolicitante; }
    public void setNomeSolicitante(String v) { this.nomeSolicitante = v; }
    public String getEmail() { return email; }
    public void setEmail(String v) { this.email = v; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String v) { this.telefone = v; }
    public String getNomeIgreja() { return nomeIgreja; }
    public void setNomeIgreja(String v) { this.nomeIgreja = v; }
    public String getCnpjIgreja() { return cnpjIgreja; }
    public void setCnpjIgreja(String v) { this.cnpjIgreja = v; }
    public String getCidade() { return cidade; }
    public void setCidade(String v) { this.cidade = v; }
    public String getEstado() { return estado; }
    public void setEstado(String v) { this.estado = v; }
    public String getMensagem() { return mensagem; }
    public void setMensagem(String v) { this.mensagem = v; }
    public StatusSolicitacaoAcesso getStatus() { return status; }
    public void setStatus(StatusSolicitacaoAcesso v) { this.status = v; }
    public Instant getDataSolicitacao() { return dataSolicitacao; }
    public void setDataSolicitacao(Instant v) { this.dataSolicitacao = v; }
    public Instant getDataAnalise() { return dataAnalise; }
    public void setDataAnalise(Instant v) { this.dataAnalise = v; }
    public String getObservacaoAdmin() { return observacaoAdmin; }
    public void setObservacaoAdmin(String v) { this.observacaoAdmin = v; }
    public Long getIgrejaCriadaId() { return igrejaCriadaId; }
    public void setIgrejaCriadaId(Long v) { this.igrejaCriadaId = v; }
}
