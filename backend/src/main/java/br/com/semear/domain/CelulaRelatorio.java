package br.com.semear.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "celula_relatorio")
public class CelulaRelatorio implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "celula_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler" }, allowSetters = true)
    private Celula celula;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "igreja_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler" }, allowSetters = true)
    private Igreja igreja;

    @NotNull
    @Column(name = "data_reuniao", nullable = false)
    private LocalDate dataReuniao;

    @NotNull
    @Column(name = "presentes", nullable = false)
    private Integer presentes;

    @NotNull
    @Column(name = "visitantes", nullable = false)
    private Integer visitantes;

    @Column(name = "observacao", columnDefinition = "text")
    private String observacao;

    @NotNull
    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Celula getCelula() { return celula; }
    public void setCelula(Celula celula) { this.celula = celula; }
    public Igreja getIgreja() { return igreja; }
    public void setIgreja(Igreja igreja) { this.igreja = igreja; }
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
