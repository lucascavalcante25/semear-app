package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.PrioridadeInformativo;
import br.com.semear.domain.enumeration.PublicoAlvoInformativo;
import br.com.semear.domain.enumeration.TipoComunicado;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;

public class ComunicadoDTO implements Serializable {

    private Long id;
    private Long igrejaId;
    private String titulo;
    private String conteudo;
    private TipoComunicado tipo;
    private PublicoAlvoInformativo publicoAlvo;
    private PrioridadeInformativo prioridade;
    private Boolean exibirNoLogin;
    private Boolean obrigatorio;
    private Boolean exibirNoSitePublico;
    private Boolean ativo;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private String ctaRotulo;
    private String ctaRota;
    private String imagemUrl;
    private String criadoPor;
    private Instant criadoEm;
    private Instant atualizadoEm;
    private String atualizadoPor;
    private Boolean lido;
    private Long totalLeituras;
    private ConfigNotificacaoDTO configNotificacao;

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

    public String getCriadoPor() {
        return criadoPor;
    }

    public void setCriadoPor(String criadoPor) {
        this.criadoPor = criadoPor;
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

    public String getAtualizadoPor() {
        return atualizadoPor;
    }

    public void setAtualizadoPor(String atualizadoPor) {
        this.atualizadoPor = atualizadoPor;
    }

    public Boolean getLido() {
        return lido;
    }

    public void setLido(Boolean lido) {
        this.lido = lido;
    }

    public Long getTotalLeituras() {
        return totalLeituras;
    }

    public void setTotalLeituras(Long totalLeituras) {
        this.totalLeituras = totalLeituras;
    }

    public ConfigNotificacaoDTO getConfigNotificacao() {
        return configNotificacao;
    }

    public void setConfigNotificacao(ConfigNotificacaoDTO configNotificacao) {
        this.configNotificacao = configNotificacao;
    }
}
