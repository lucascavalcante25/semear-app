package br.com.semear.domain;

import br.com.semear.domain.enumeration.PrioridadeSolicitacaoSuporte;
import br.com.semear.domain.enumeration.StatusSolicitacaoSuporte;
import br.com.semear.domain.enumeration.TipoSolicitacaoSuporte;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "solicitacao_suporte")
public class SolicitacaoSuporte extends AbstractAuditingEntity<Long> implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "igreja_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler" }, allowSetters = true)
    private Igreja igreja;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_solicitante_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler", "password", "authorities" }, allowSetters = true)
    private User usuarioSolicitante;

    @NotNull
    @Size(max = 255)
    @Column(name = "nome_solicitante", nullable = false)
    private String nomeSolicitante;

    @NotNull
    @Size(max = 255)
    @Column(name = "email_solicitante", nullable = false)
    private String emailSolicitante;

    @Size(max = 20)
    @Column(name = "telefone_solicitante", length = 20)
    private String telefoneSolicitante;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 30)
    private TipoSolicitacaoSuporte tipo;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "prioridade", nullable = false, length = 20)
    private PrioridadeSolicitacaoSuporte prioridade = PrioridadeSolicitacaoSuporte.MEDIA;

    @NotNull
    @Size(max = 120)
    @Column(name = "titulo", nullable = false, length = 120)
    private String titulo;

    @NotNull
    @Column(name = "descricao", nullable = false, columnDefinition = "text")
    private String descricao;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private StatusSolicitacaoSuporte status = StatusSolicitacaoSuporte.ABERTA;

    @Column(name = "resposta_admin", columnDefinition = "text")
    private String respostaAdmin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "respondido_por_id")
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler", "password", "authorities" }, allowSetters = true)
    private User respondidoPor;

    @Column(name = "observacao_interna_admin", columnDefinition = "text")
    private String observacaoInternaAdmin;

    @NotNull
    @Column(name = "lida_pelo_cliente", nullable = false)
    private Boolean lidaPeloCliente = false;

    @NotNull
    @Column(name = "lida_pelo_suporte", nullable = false)
    private Boolean lidaPeloSuporte = false;

    @Column(name = "data_resposta")
    private Instant dataResposta;

    @Column(name = "data_finalizacao")
    private Instant dataFinalizacao;

    @OneToMany(mappedBy = "solicitacaoSuporte", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties(value = { "solicitacaoSuporte" }, allowSetters = true)
    private List<SolicitacaoSuporteAnexo> anexos = new ArrayList<>();

    @Override
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Igreja getIgreja() {
        return igreja;
    }

    public void setIgreja(Igreja igreja) {
        this.igreja = igreja;
    }

    public User getUsuarioSolicitante() {
        return usuarioSolicitante;
    }

    public void setUsuarioSolicitante(User usuarioSolicitante) {
        this.usuarioSolicitante = usuarioSolicitante;
    }

    public String getNomeSolicitante() {
        return nomeSolicitante;
    }

    public void setNomeSolicitante(String nomeSolicitante) {
        this.nomeSolicitante = nomeSolicitante;
    }

    public String getEmailSolicitante() {
        return emailSolicitante;
    }

    public void setEmailSolicitante(String emailSolicitante) {
        this.emailSolicitante = emailSolicitante;
    }

    public String getTelefoneSolicitante() {
        return telefoneSolicitante;
    }

    public void setTelefoneSolicitante(String telefoneSolicitante) {
        this.telefoneSolicitante = telefoneSolicitante;
    }

    public TipoSolicitacaoSuporte getTipo() {
        return tipo;
    }

    public void setTipo(TipoSolicitacaoSuporte tipo) {
        this.tipo = tipo;
    }

    public PrioridadeSolicitacaoSuporte getPrioridade() {
        return prioridade;
    }

    public void setPrioridade(PrioridadeSolicitacaoSuporte prioridade) {
        this.prioridade = prioridade;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public StatusSolicitacaoSuporte getStatus() {
        return status;
    }

    public void setStatus(StatusSolicitacaoSuporte status) {
        this.status = status;
    }

    public String getRespostaAdmin() {
        return respostaAdmin;
    }

    public void setRespostaAdmin(String respostaAdmin) {
        this.respostaAdmin = respostaAdmin;
    }

    public User getRespondidoPor() {
        return respondidoPor;
    }

    public void setRespondidoPor(User respondidoPor) {
        this.respondidoPor = respondidoPor;
    }

    public String getObservacaoInternaAdmin() {
        return observacaoInternaAdmin;
    }

    public void setObservacaoInternaAdmin(String observacaoInternaAdmin) {
        this.observacaoInternaAdmin = observacaoInternaAdmin;
    }

    public Boolean getLidaPeloCliente() {
        return lidaPeloCliente;
    }

    public void setLidaPeloCliente(Boolean lidaPeloCliente) {
        this.lidaPeloCliente = lidaPeloCliente;
    }

    public Boolean getLidaPeloSuporte() {
        return lidaPeloSuporte;
    }

    public void setLidaPeloSuporte(Boolean lidaPeloSuporte) {
        this.lidaPeloSuporte = lidaPeloSuporte;
    }

    public Instant getDataResposta() {
        return dataResposta;
    }

    public void setDataResposta(Instant dataResposta) {
        this.dataResposta = dataResposta;
    }

    public Instant getDataFinalizacao() {
        return dataFinalizacao;
    }

    public void setDataFinalizacao(Instant dataFinalizacao) {
        this.dataFinalizacao = dataFinalizacao;
    }

    public List<SolicitacaoSuporteAnexo> getAnexos() {
        return anexos;
    }

    public void setAnexos(List<SolicitacaoSuporteAnexo> anexos) {
        this.anexos = anexos;
    }
}
