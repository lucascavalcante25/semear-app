package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.CategoriaEvento;
import br.com.semear.domain.enumeration.PublicoEvento;
import br.com.semear.domain.enumeration.StatusEvento;
import br.com.semear.service.dto.ConfigNotificacaoDTO;
import java.io.Serializable;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class EventoDTO implements Serializable {

    private Long id;
    private Long igrejaId;
    private String titulo;
    private String descricao;
    private Instant dataInicio;
    private Instant dataFim;
    private String local;
    private PublicoEvento publico;
    private Boolean inscricoesAbertas;
    private Integer capacidade;
    private CategoriaEvento categoria;
    private StatusEvento status;
    private String imagemUrl;
    private String linkExterno;
    private Instant prazoCancelamentoInscricao;
    private Integer totalInscritos;
    private Boolean inscrito;
    private String situacaoInscricao;
    private Boolean lotado;
    private Boolean inscricoesEncerradas;
    private Integer vagasDisponiveis;
    private Instant criadoEm;
    private List<EventoInscricaoDTO> inscricoes = new ArrayList<>();
    private ConfigNotificacaoDTO configNotificacao;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getIgrejaId() { return igrejaId; }
    public void setIgrejaId(Long igrejaId) { this.igrejaId = igrejaId; }
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
    public Integer getTotalInscritos() { return totalInscritos; }
    public void setTotalInscritos(Integer totalInscritos) { this.totalInscritos = totalInscritos; }
    public Boolean getInscrito() { return inscrito; }
    public void setInscrito(Boolean inscrito) { this.inscrito = inscrito; }
    public String getSituacaoInscricao() { return situacaoInscricao; }
    public void setSituacaoInscricao(String situacaoInscricao) { this.situacaoInscricao = situacaoInscricao; }
    public Boolean getLotado() { return lotado; }
    public void setLotado(Boolean lotado) { this.lotado = lotado; }
    public Boolean getInscricoesEncerradas() { return inscricoesEncerradas; }
    public void setInscricoesEncerradas(Boolean inscricoesEncerradas) { this.inscricoesEncerradas = inscricoesEncerradas; }
    public Integer getVagasDisponiveis() { return vagasDisponiveis; }
    public void setVagasDisponiveis(Integer vagasDisponiveis) { this.vagasDisponiveis = vagasDisponiveis; }
    public Instant getCriadoEm() { return criadoEm; }
    public void setCriadoEm(Instant criadoEm) { this.criadoEm = criadoEm; }
    public List<EventoInscricaoDTO> getInscricoes() { return inscricoes; }
    public void setInscricoes(List<EventoInscricaoDTO> inscricoes) { this.inscricoes = inscricoes; }
    public ConfigNotificacaoDTO getConfigNotificacao() { return configNotificacao; }
    public void setConfigNotificacao(ConfigNotificacaoDTO configNotificacao) { this.configNotificacao = configNotificacao; }
}
