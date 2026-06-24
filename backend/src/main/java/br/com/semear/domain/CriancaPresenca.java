package br.com.semear.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "crianca_presenca")
public class CriancaPresenca implements Serializable {

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
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crianca_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler" }, allowSetters = true)
    private Crianca crianca;

    @NotNull
    @Column(name = "data_presenca", nullable = false)
    private LocalDate dataPresenca;

    @NotNull
    @Column(name = "entrada_em", nullable = false)
    private Instant entradaEm;

    @Column(name = "saida_em")
    private Instant saidaEm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registrado_por_id")
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler" }, allowSetters = true)
    private User registradoPor;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Igreja getIgreja() {
        return igreja;
    }

    public void setIgreja(Igreja igreja) {
        this.igreja = igreja;
    }

    public Crianca getCrianca() {
        return crianca;
    }

    public void setCrianca(Crianca crianca) {
        this.crianca = crianca;
    }

    public LocalDate getDataPresenca() {
        return dataPresenca;
    }

    public void setDataPresenca(LocalDate dataPresenca) {
        this.dataPresenca = dataPresenca;
    }

    public Instant getEntradaEm() {
        return entradaEm;
    }

    public void setEntradaEm(Instant entradaEm) {
        this.entradaEm = entradaEm;
    }

    public Instant getSaidaEm() {
        return saidaEm;
    }

    public void setSaidaEm(Instant saidaEm) {
        this.saidaEm = saidaEm;
    }

    public User getRegistradoPor() {
        return registradoPor;
    }

    public void setRegistradoPor(User registradoPor) {
        this.registradoPor = registradoPor;
    }
}
