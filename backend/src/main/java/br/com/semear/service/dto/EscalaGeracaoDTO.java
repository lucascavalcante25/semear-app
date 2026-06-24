package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.OrigemEscalaGeracao;
import br.com.semear.domain.enumeration.StatusEscalaPublicacao;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;

public class EscalaGeracaoDTO implements Serializable {

    private Long id;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private StatusEscalaPublicacao status;
    private OrigemEscalaGeracao origem;
    private Instant criadoEm;
    private Instant publicadoEm;
    private Integer totalEscalas;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }
    public LocalDate getDataFim() { return dataFim; }
    public void setDataFim(LocalDate dataFim) { this.dataFim = dataFim; }
    public StatusEscalaPublicacao getStatus() { return status; }
    public void setStatus(StatusEscalaPublicacao status) { this.status = status; }
    public OrigemEscalaGeracao getOrigem() { return origem; }
    public void setOrigem(OrigemEscalaGeracao origem) { this.origem = origem; }
    public Instant getCriadoEm() { return criadoEm; }
    public void setCriadoEm(Instant criadoEm) { this.criadoEm = criadoEm; }
    public Instant getPublicadoEm() { return publicadoEm; }
    public void setPublicadoEm(Instant publicadoEm) { this.publicadoEm = publicadoEm; }
    public Integer getTotalEscalas() { return totalEscalas; }
    public void setTotalEscalas(Integer totalEscalas) { this.totalEscalas = totalEscalas; }
}
