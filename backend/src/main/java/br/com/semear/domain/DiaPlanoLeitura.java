package br.com.semear.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A DiaPlanoLeitura.
 */
@Entity
@Table(name = "dia_plano_leitura")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class DiaPlanoLeitura implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Min(value = 1)
    @Column(name = "numero_dia", nullable = false)
    private Integer numeroDia;

    @Column(name = "titulo")
    private String titulo;

    @Lob
    @Column(name = "leituras_json", nullable = false)
    private String leiturasJson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "dias" }, allowSetters = true)
    private PlanoLeitura plano;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "dias" }, allowSetters = true)
    private PlanoLeitura planoLeitura;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public DiaPlanoLeitura id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getNumeroDia() {
        return this.numeroDia;
    }

    public DiaPlanoLeitura numeroDia(Integer numeroDia) {
        this.setNumeroDia(numeroDia);
        return this;
    }

    public void setNumeroDia(Integer numeroDia) {
        this.numeroDia = numeroDia;
    }

    public String getTitulo() {
        return this.titulo;
    }

    public DiaPlanoLeitura titulo(String titulo) {
        this.setTitulo(titulo);
        return this;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getLeiturasJson() {
        return this.leiturasJson;
    }

    public DiaPlanoLeitura leiturasJson(String leiturasJson) {
        this.setLeiturasJson(leiturasJson);
        return this;
    }

    public void setLeiturasJson(String leiturasJson) {
        this.leiturasJson = leiturasJson;
    }

    public PlanoLeitura getPlano() {
        return this.plano;
    }

    public void setPlano(PlanoLeitura planoLeitura) {
        this.plano = planoLeitura;
    }

    public DiaPlanoLeitura plano(PlanoLeitura planoLeitura) {
        this.setPlano(planoLeitura);
        return this;
    }

    public PlanoLeitura getPlanoLeitura() {
        return this.planoLeitura;
    }

    public void setPlanoLeitura(PlanoLeitura planoLeitura) {
        this.planoLeitura = planoLeitura;
    }

    public DiaPlanoLeitura planoLeitura(PlanoLeitura planoLeitura) {
        this.setPlanoLeitura(planoLeitura);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof DiaPlanoLeitura)) {
            return false;
        }
        return getId() != null && getId().equals(((DiaPlanoLeitura) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "DiaPlanoLeitura{" +
            "id=" + getId() +
            ", numeroDia=" + getNumeroDia() +
            ", titulo='" + getTitulo() + "'" +
            ", leiturasJson='" + getLeiturasJson() + "'" +
            "}";
    }
}
