package br.com.semear.domain;

import br.com.semear.domain.enumeration.PrioridadeInformativo;
import br.com.semear.domain.enumeration.PublicoAlvoInformativo;
import br.com.semear.domain.enumeration.TipoComunicado;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

@Entity
@Table(name = "comunicado")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Comunicado implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 200)
    @Column(name = "titulo", nullable = false, length = 200)
    private String titulo;

    @NotNull
    @Column(name = "conteudo", nullable = false, columnDefinition = "text")
    private String conteudo;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 30)
    private TipoComunicado tipo = TipoComunicado.NORMAL;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "publico_alvo", nullable = false, length = 30)
    private PublicoAlvoInformativo publicoAlvo = PublicoAlvoInformativo.TODOS;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "prioridade", nullable = false, length = 20)
    private PrioridadeInformativo prioridade = PrioridadeInformativo.NORMAL;

    @NotNull
    @Column(name = "exibir_no_login", nullable = false)
    private Boolean exibirNoLogin = false;

    @NotNull
    @Column(name = "obrigatorio", nullable = false)
    private Boolean obrigatorio = false;

    @NotNull
    @Column(name = "exibir_no_site_publico", nullable = false)
    private Boolean exibirNoSitePublico = true;

    @NotNull
    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "data_fim")
    private LocalDate dataFim;

    @NotNull
    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Size(max = 100)
    @Column(name = "cta_rotulo", length = 100)
    private String ctaRotulo;

    @Size(max = 255)
    @Column(name = "cta_rota", length = 255)
    private String ctaRota;

    @Size(max = 500)
    @Column(name = "imagem_url", length = 500)
    private String imagemUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "igreja_id")
    private Igreja igreja;

    @NotNull
    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm;

    @NotNull
    @Column(name = "criado_por", nullable = false)
    private String criadoPor;

    @Column(name = "atualizado_em")
    private Instant atualizadoEm;

    @Column(name = "atualizado_por")
    private String atualizadoPor;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getConteudo() {
        return conteudo;
    }

    public void setConteudo(String conteudo) {
        this.conteudo = conteudo;
    }

    public TipoComunicado getTipo() {
        return tipo;
    }

    public void setTipo(TipoComunicado tipo) {
        this.tipo = tipo;
    }

    public PublicoAlvoInformativo getPublicoAlvo() {
        return publicoAlvo;
    }

    public void setPublicoAlvo(PublicoAlvoInformativo publicoAlvo) {
        this.publicoAlvo = publicoAlvo;
    }

    public PrioridadeInformativo getPrioridade() {
        return prioridade;
    }

    public void setPrioridade(PrioridadeInformativo prioridade) {
        this.prioridade = prioridade;
    }

    public Boolean getExibirNoLogin() {
        return exibirNoLogin;
    }

    public void setExibirNoLogin(Boolean exibirNoLogin) {
        this.exibirNoLogin = exibirNoLogin;
    }

    public Boolean getObrigatorio() {
        return obrigatorio;
    }

    public void setObrigatorio(Boolean obrigatorio) {
        this.obrigatorio = obrigatorio;
    }

    public Boolean getExibirNoSitePublico() {
        return exibirNoSitePublico;
    }

    public void setExibirNoSitePublico(Boolean exibirNoSitePublico) {
        this.exibirNoSitePublico = exibirNoSitePublico;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDate getDataFim() {
        return dataFim;
    }

    public void setDataFim(LocalDate dataFim) {
        this.dataFim = dataFim;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public String getCtaRotulo() {
        return ctaRotulo;
    }

    public void setCtaRotulo(String ctaRotulo) {
        this.ctaRotulo = ctaRotulo;
    }

    public String getCtaRota() {
        return ctaRota;
    }

    public void setCtaRota(String ctaRota) {
        this.ctaRota = ctaRota;
    }

    public String getImagemUrl() {
        return imagemUrl;
    }

    public void setImagemUrl(String imagemUrl) {
        this.imagemUrl = imagemUrl;
    }

    public Igreja getIgreja() {
        return igreja;
    }

    public void setIgreja(Igreja igreja) {
        this.igreja = igreja;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(Instant criadoEm) {
        this.criadoEm = criadoEm;
    }

    public String getCriadoPor() {
        return criadoPor;
    }

    public void setCriadoPor(String criadoPor) {
        this.criadoPor = criadoPor;
    }

    public Instant getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setAtualizadoEm(Instant atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }

    public String getAtualizadoPor() {
        return atualizadoPor;
    }

    public void setAtualizadoPor(String atualizadoPor) {
        this.atualizadoPor = atualizadoPor;
    }
}
