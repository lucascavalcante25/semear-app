package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.PublicoEvento;
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
    private Integer totalInscritos;
    private Boolean inscrito;
    private Instant criadoEm;
    private List<EventoInscricaoDTO> inscricoes = new ArrayList<>();

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
    public Integer getTotalInscritos() { return totalInscritos; }
    public void setTotalInscritos(Integer totalInscritos) { this.totalInscritos = totalInscritos; }
    public Boolean getInscrito() { return inscrito; }
    public void setInscrito(Boolean inscrito) { this.inscrito = inscrito; }
    public Instant getCriadoEm() { return criadoEm; }
    public void setCriadoEm(Instant criadoEm) { this.criadoEm = criadoEm; }
    public List<EventoInscricaoDTO> getInscricoes() { return inscricoes; }
    public void setInscricoes(List<EventoInscricaoDTO> inscricoes) { this.inscricoes = inscricoes; }
}
