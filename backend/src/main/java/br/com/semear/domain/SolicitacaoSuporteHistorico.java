package br.com.semear.domain;

import br.com.semear.domain.enumeration.AcaoSolicitacaoSuporteHistorico;
import br.com.semear.domain.enumeration.StatusSolicitacaoSuporte;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "solicitacao_suporte_historico")
public class SolicitacaoSuporteHistorico implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitacao_suporte_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler" }, allowSetters = true)
    private SolicitacaoSuporte solicitacaoSuporte;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler", "password", "authorities" }, allowSetters = true)
    private User usuario;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "acao", nullable = false, length = 30)
    private AcaoSolicitacaoSuporteHistorico acao;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_anterior", length = 30)
    private StatusSolicitacaoSuporte statusAnterior;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_novo", length = 30)
    private StatusSolicitacaoSuporte statusNovo;

    @Column(name = "mensagem", columnDefinition = "text")
    private String mensagem;

    @NotNull
    @Column(name = "data_acao", nullable = false)
    private Instant dataAcao = Instant.now();

    @NotNull
    @Column(name = "visivel_para_cliente", nullable = false)
    private Boolean visivelParaCliente = true;

    @Size(max = 120)
    @Column(name = "usuario_nome", length = 120)
    private String usuarioNome;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SolicitacaoSuporte getSolicitacaoSuporte() {
        return solicitacaoSuporte;
    }

    public void setSolicitacaoSuporte(SolicitacaoSuporte solicitacaoSuporte) {
        this.solicitacaoSuporte = solicitacaoSuporte;
    }

    public User getUsuario() {
        return usuario;
    }

    public void setUsuario(User usuario) {
        this.usuario = usuario;
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

    public Boolean getVisivelParaCliente() {
        return visivelParaCliente;
    }

    public void setVisivelParaCliente(Boolean visivelParaCliente) {
        this.visivelParaCliente = visivelParaCliente;
    }

    public String getUsuarioNome() {
        return usuarioNome;
    }

    public void setUsuarioNome(String usuarioNome) {
        this.usuarioNome = usuarioNome;
    }
}
