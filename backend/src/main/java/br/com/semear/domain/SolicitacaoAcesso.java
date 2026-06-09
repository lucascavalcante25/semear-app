package br.com.semear.domain;

import br.com.semear.domain.enumeration.StatusSolicitacaoAcesso;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "solicitacao_acesso")
public class SolicitacaoAcesso implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @Column(name = "nome_solicitante", nullable = false)
    private String nomeSolicitante;

    @NotNull
    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "telefone", length = 50)
    private String telefone;

    @NotNull
    @Column(name = "nome_igreja", nullable = false)
    private String nomeIgreja;

    @Column(name = "cnpj_igreja", length = 20)
    private String cnpjIgreja;

    @Column(name = "cidade", length = 100)
    private String cidade;

    @Column(name = "estado", length = 2)
    private String estado;

    @Column(name = "mensagem", columnDefinition = "text")
    private String mensagem;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StatusSolicitacaoAcesso status = StatusSolicitacaoAcesso.PENDENTE;

    @NotNull
    @Column(name = "data_solicitacao", nullable = false)
    private Instant dataSolicitacao;

    @Column(name = "data_analise")
    private Instant dataAnalise;

    @Column(name = "observacao_admin", columnDefinition = "text")
    private String observacaoAdmin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "igreja_criada_id")
    private Igreja igrejaCriada;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomeSolicitante() {
        return nomeSolicitante;
    }

    public void setNomeSolicitante(String nomeSolicitante) {
        this.nomeSolicitante = nomeSolicitante;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getNomeIgreja() {
        return nomeIgreja;
    }

    public void setNomeIgreja(String nomeIgreja) {
        this.nomeIgreja = nomeIgreja;
    }

    public String getCnpjIgreja() {
        return cnpjIgreja;
    }

    public void setCnpjIgreja(String cnpjIgreja) {
        this.cnpjIgreja = cnpjIgreja;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }

    public StatusSolicitacaoAcesso getStatus() {
        return status;
    }

    public void setStatus(StatusSolicitacaoAcesso status) {
        this.status = status;
    }

    public Instant getDataSolicitacao() {
        return dataSolicitacao;
    }

    public void setDataSolicitacao(Instant dataSolicitacao) {
        this.dataSolicitacao = dataSolicitacao;
    }

    public Instant getDataAnalise() {
        return dataAnalise;
    }

    public void setDataAnalise(Instant dataAnalise) {
        this.dataAnalise = dataAnalise;
    }

    public String getObservacaoAdmin() {
        return observacaoAdmin;
    }

    public void setObservacaoAdmin(String observacaoAdmin) {
        this.observacaoAdmin = observacaoAdmin;
    }

    public Igreja getIgrejaCriada() {
        return igrejaCriada;
    }

    public void setIgrejaCriada(Igreja igrejaCriada) {
        this.igrejaCriada = igrejaCriada;
    }
}
