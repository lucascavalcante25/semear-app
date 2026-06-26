package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.CategoriaEvento;
import br.com.semear.domain.enumeration.PublicoEvento;
import br.com.semear.domain.enumeration.StatusEvento;
import java.io.Serializable;
import java.time.Instant;

public class EventoFiltroDTO implements Serializable {

    private String busca;
    private CategoriaEvento categoria;
    private PublicoEvento publico;
    private Boolean inscricoesAbertas;
    private StatusEvento status;
    private String periodo;

    public String getBusca() { return busca; }
    public void setBusca(String busca) { this.busca = busca; }
    public CategoriaEvento getCategoria() { return categoria; }
    public void setCategoria(CategoriaEvento categoria) { this.categoria = categoria; }
    public PublicoEvento getPublico() { return publico; }
    public void setPublico(PublicoEvento publico) { this.publico = publico; }
    public Boolean getInscricoesAbertas() { return inscricoesAbertas; }
    public void setInscricoesAbertas(Boolean inscricoesAbertas) { this.inscricoesAbertas = inscricoesAbertas; }
    public StatusEvento getStatus() { return status; }
    public void setStatus(StatusEvento status) { this.status = status; }
    public String getPeriodo() { return periodo; }
    public void setPeriodo(String periodo) { this.periodo = periodo; }
}
