package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.PrioridadeInformativo;
import br.com.semear.domain.enumeration.PublicoAlvoInformativo;
import br.com.semear.domain.enumeration.TipoInformativo;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;

public class InformativoDTO implements Serializable {

    private Long id;
    private Long igrejaId;
    private String titulo;
    private String conteudo;
    private TipoInformativo tipo;
    private PublicoAlvoInformativo publicoAlvo;
    private PrioridadeInformativo prioridade;
    private Boolean exibirNoLogin;
    private Boolean obrigatorio;
    private Boolean ativo;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private String ctaRotulo;
    private String ctaRota;
    private String imagemUrl;
    private Long criadoPorId;
    private String criadoPorNome;
    private Instant criadoEm;
    private Instant atualizadoEm;
    private Boolean lido;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIgrejaId() {
        return igrejaId;
    }

    public void setIgrejaId(Long igrejaId) {
        this.igrejaId = igrejaId;
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

    public TipoInformativo getTipo() {
        return tipo;
    }

    public void setTipo(TipoInformativo tipo) {
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

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
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

    public Long getCriadoPorId() {
        return criadoPorId;
    }

    public void setCriadoPorId(Long criadoPorId) {
        this.criadoPorId = criadoPorId;
    }

    public String getCriadoPorNome() {
        return criadoPorNome;
    }

    public void setCriadoPorNome(String criadoPorNome) {
        this.criadoPorNome = criadoPorNome;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(Instant criadoEm) {
        this.criadoEm = criadoEm;
    }

    public Instant getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setAtualizadoEm(Instant atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }

    public Boolean getLido() {
        return lido;
    }

    public void setLido(Boolean lido) {
        this.lido = lido;
    }
}
