package br.com.semear.service.dto;

import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;

public class CelulaRelatorioDTO implements Serializable {

    private Long id;
    private Long celulaId;
    private Long igrejaId;
    private LocalDate dataReuniao;
    private Integer presentes;
    private Integer visitantes;
    private String observacao;
    private Instant criadoEm;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCelulaId() { return celulaId; }
    public void setCelulaId(Long celulaId) { this.celulaId = celulaId; }
    public Long getIgrejaId() { return igrejaId; }
    public void setIgrejaId(Long igrejaId) { this.igrejaId = igrejaId; }
    public LocalDate getDataReuniao() { return dataReuniao; }
    public void setDataReuniao(LocalDate dataReuniao) { this.dataReuniao = dataReuniao; }
    public Integer getPresentes() { return presentes; }
    public void setPresentes(Integer presentes) { this.presentes = presentes; }
    public Integer getVisitantes() { return visitantes; }
    public void setVisitantes(Integer visitantes) { this.visitantes = visitantes; }
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
    public Instant getCriadoEm() { return criadoEm; }
    public void setCriadoEm(Instant criadoEm) { this.criadoEm = criadoEm; }
}
