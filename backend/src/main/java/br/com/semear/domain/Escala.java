package br.com.semear.domain;

import br.com.semear.domain.enumeration.StatusEscalaPublicacao;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "escala")
public class Escala implements Serializable {

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_id")
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler" }, allowSetters = true)
    private Departamento departamento;

    @NotNull
    @Column(name = "titulo", nullable = false, length = 200)
    private String titulo;

    @NotNull
    @Column(name = "data_evento", nullable = false)
    private Instant dataEvento;

    @Column(name = "observacao", columnDefinition = "text")
    private String observacao;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StatusEscalaPublicacao status = StatusEscalaPublicacao.PUBLICADA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "culto_registro_id")
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler" }, allowSetters = true)
    private CultoRegistro cultoRegistro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "geracao_id")
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler" }, allowSetters = true)
    private EscalaGeracao geracao;

    @NotNull
    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Igreja getIgreja() { return igreja; }
    public void setIgreja(Igreja igreja) { this.igreja = igreja; }
    public Departamento getDepartamento() { return departamento; }
    public void setDepartamento(Departamento departamento) { this.departamento = departamento; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public Instant getDataEvento() { return dataEvento; }
    public void setDataEvento(Instant dataEvento) { this.dataEvento = dataEvento; }
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
    public StatusEscalaPublicacao getStatus() { return status; }
    public void setStatus(StatusEscalaPublicacao status) { this.status = status; }
    public CultoRegistro getCultoRegistro() { return cultoRegistro; }
    public void setCultoRegistro(CultoRegistro cultoRegistro) { this.cultoRegistro = cultoRegistro; }
    public EscalaGeracao getGeracao() { return geracao; }
    public void setGeracao(EscalaGeracao geracao) { this.geracao = geracao; }
    public Instant getCriadoEm() { return criadoEm; }
    public void setCriadoEm(Instant criadoEm) { this.criadoEm = criadoEm; }
}
