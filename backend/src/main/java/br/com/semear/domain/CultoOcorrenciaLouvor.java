package br.com.semear.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;

@Entity
@Table(name = "culto_ocorrencia_louvor")
public class CultoOcorrenciaLouvor implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "culto_ocorrencia_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler" }, allowSetters = true)
    private CultoOcorrencia cultoOcorrencia;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "louvor_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler" }, allowSetters = true)
    private Louvor louvor;

    @NotNull
    @Column(name = "ordem", nullable = false)
    private Integer ordem;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CultoOcorrencia getCultoOcorrencia() { return cultoOcorrencia; }
    public void setCultoOcorrencia(CultoOcorrencia cultoOcorrencia) { this.cultoOcorrencia = cultoOcorrencia; }
    public Louvor getLouvor() { return louvor; }
    public void setLouvor(Louvor louvor) { this.louvor = louvor; }
    public Integer getOrdem() { return ordem; }
    public void setOrdem(Integer ordem) { this.ordem = ordem; }
}
