package br.com.semear.domain;

import br.com.semear.domain.enumeration.RegraGeneroEscala;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;

@Entity
@Table(name = "culto_escala_regra")
public class CultoEscalaRegra implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "culto_registro_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler" }, allowSetters = true)
    private CultoRegistro cultoRegistro;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler" }, allowSetters = true)
    private Departamento departamento;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "regra_genero", nullable = false, length = 20)
    private RegraGeneroEscala regraGenero;

    @NotNull
    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CultoRegistro getCultoRegistro() { return cultoRegistro; }
    public void setCultoRegistro(CultoRegistro cultoRegistro) { this.cultoRegistro = cultoRegistro; }
    public Departamento getDepartamento() { return departamento; }
    public void setDepartamento(Departamento departamento) { this.departamento = departamento; }
    public RegraGeneroEscala getRegraGenero() { return regraGenero; }
    public void setRegraGenero(RegraGeneroEscala regraGenero) { this.regraGenero = regraGenero; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}
