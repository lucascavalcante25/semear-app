package br.com.semear.domain;

import br.com.semear.domain.enumeration.CategoriaEvento;
import br.com.semear.domain.enumeration.PublicoEvento;
import br.com.semear.domain.enumeration.StatusEvento;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "evento")
public class Evento implements Serializable {

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
    @Column(name = "titulo", nullable = false, length = 200)
    private String titulo;

    @Column(name = "descricao", columnDefinition = "text")
    private String descricao;

    @NotNull
    @Column(name = "data_inicio", nullable = false)
    private Instant dataInicio;

    @Column(name = "data_fim")
    private Instant dataFim;

    @Column(name = "local", length = 300)
    private String local;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "publico", nullable = false, length = 20)
    private PublicoEvento publico = PublicoEvento.INTERNO;

    @NotNull
    @Column(name = "inscricoes_abertas", nullable = false)
    private Boolean inscricoesAbertas = false;

    @Column(name = "capacidade")
    private Integer capacidade;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "categoria", nullable = false, length = 30)
    private CategoriaEvento categoria = CategoriaEvento.OUTRO;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StatusEvento status = StatusEvento.PUBLICADO;

    @Column(name = "imagem_url", length = 500)
    private String imagemUrl;

    @Column(name = "link_externo", length = 500)
    private String linkExterno;

    @Column(name = "prazo_cancelamento_inscricao")
    private Instant prazoCancelamentoInscricao;

    @NotNull
    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm = Instant.now();

    @Lob
    @Column(name = "config_notificacao")
    private String configNotificacao;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Igreja getIgreja() { return igreja; }
    public void setIgreja(Igreja igreja) { this.igreja = igreja; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public Instant getDataInicio() { return dataInicio; }
    public void setDataInicio(Instant dataInicio) { this.dataInicio = dataInicio; }
    public Instant getDataFim() { return dataFim; }
    public void setDataFim(Instant dataFim) { this.dataFim = dataFim; }
    public String getLocal() { return local; }
    public void setLocal(String local) { this.local = local; }
    public PublicoEvento getPublico() { return publico; }
    public void setPublico(PublicoEvento publico) { this.publico = publico; }
    public Boolean getInscricoesAbertas() { return inscricoesAbertas; }
    public void setInscricoesAbertas(Boolean inscricoesAbertas) { this.inscricoesAbertas = inscricoesAbertas; }
    public Integer getCapacidade() { return capacidade; }
    public void setCapacidade(Integer capacidade) { this.capacidade = capacidade; }
    public CategoriaEvento getCategoria() { return categoria; }
    public void setCategoria(CategoriaEvento categoria) { this.categoria = categoria; }
    public StatusEvento getStatus() { return status; }
    public void setStatus(StatusEvento status) { this.status = status; }
    public String getImagemUrl() { return imagemUrl; }
    public void setImagemUrl(String imagemUrl) { this.imagemUrl = imagemUrl; }
    public String getLinkExterno() { return linkExterno; }
    public void setLinkExterno(String linkExterno) { this.linkExterno = linkExterno; }
    public Instant getPrazoCancelamentoInscricao() { return prazoCancelamentoInscricao; }
    public void setPrazoCancelamentoInscricao(Instant prazoCancelamentoInscricao) { this.prazoCancelamentoInscricao = prazoCancelamentoInscricao; }
    public Instant getCriadoEm() { return criadoEm; }
    public void setCriadoEm(Instant criadoEm) { this.criadoEm = criadoEm; }
    public String getConfigNotificacao() { return configNotificacao; }
    public void setConfigNotificacao(String configNotificacao) { this.configNotificacao = configNotificacao; }
}
