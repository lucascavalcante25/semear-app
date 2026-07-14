package br.com.semear.domain;

import br.com.semear.domain.enumeration.DiaSemanaCulto;
import br.com.semear.domain.enumeration.FrequenciaCulto;
import br.com.semear.domain.enumeration.TipoCulto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "culto_registro")
public class CultoRegistro implements Serializable {

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
    @Column(name = "nome", nullable = false, length = 150)
    private String nome;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "dia_semana", nullable = false, length = 20)
    private DiaSemanaCulto diaSemana;

    @NotNull
    @Column(name = "horario", nullable = false, length = 10)
    private String horario;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 20)
    private TipoCulto tipo = TipoCulto.RECORRENTE;

    @Column(name = "data_especifica")
    private LocalDate dataEspecifica;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "frequencia", nullable = false, length = 30)
    private FrequenciaCulto frequencia = FrequenciaCulto.TODA_SEMANA;

    /** Primeira ocorrência da série (obrigatória se frequência = SEMANAS_ALTERNADAS). */
    @Column(name = "data_ancora")
    private LocalDate dataAncora;

    @NotNull
    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @NotNull
    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Igreja getIgreja() { return igreja; }
    public void setIgreja(Igreja igreja) { this.igreja = igreja; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public DiaSemanaCulto getDiaSemana() { return diaSemana; }
    public void setDiaSemana(DiaSemanaCulto diaSemana) { this.diaSemana = diaSemana; }
    public String getHorario() { return horario; }
    public void setHorario(String horario) { this.horario = horario; }
    public TipoCulto getTipo() { return tipo; }
    public void setTipo(TipoCulto tipo) { this.tipo = tipo; }
    public LocalDate getDataEspecifica() { return dataEspecifica; }
    public void setDataEspecifica(LocalDate dataEspecifica) { this.dataEspecifica = dataEspecifica; }
    public FrequenciaCulto getFrequencia() { return frequencia; }
    public void setFrequencia(FrequenciaCulto frequencia) { this.frequencia = frequencia; }
    public LocalDate getDataAncora() { return dataAncora; }
    public void setDataAncora(LocalDate dataAncora) { this.dataAncora = dataAncora; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
    public Instant getCriadoEm() { return criadoEm; }
    public void setCriadoEm(Instant criadoEm) { this.criadoEm = criadoEm; }
}
