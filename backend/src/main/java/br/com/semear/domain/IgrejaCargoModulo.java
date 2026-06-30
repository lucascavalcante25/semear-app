package br.com.semear.domain;

import br.com.semear.domain.enumeration.NivelAcessoModulo;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;

@Entity
@Table(
    name = "igreja_cargo_modulo",
    uniqueConstraints = { @UniqueConstraint(name = "uk_igreja_cargo_modulo", columnNames = { "cargo_id", "modulo" }) }
)
public class IgrejaCargoModulo implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cargo_id", nullable = false)
    @JsonIgnoreProperties(value = { "modulos", "igreja", "hibernateLazyInitializer", "handler" }, allowSetters = true)
    private IgrejaCargo cargo;

    @NotNull
    @Size(max = 60)
    @Column(name = "modulo", nullable = false, length = 60)
    private String modulo;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "nivel", nullable = false, length = 10)
    private NivelAcessoModulo nivel;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public IgrejaCargo getCargo() {
        return cargo;
    }

    public void setCargo(IgrejaCargo cargo) {
        this.cargo = cargo;
    }

    public String getModulo() {
        return modulo;
    }

    public void setModulo(String modulo) {
        this.modulo = modulo;
    }

    public NivelAcessoModulo getNivel() {
        return nivel;
    }

    public void setNivel(NivelAcessoModulo nivel) {
        this.nivel = nivel;
    }
}
