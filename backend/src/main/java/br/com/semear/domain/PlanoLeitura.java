package br.com.semear.domain;

import br.com.semear.domain.enumeration.TipoPlanoLeitura;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A PlanoLeitura.
 */
@Entity
@Table(name = "plano_leitura")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PlanoLeitura implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "descricao")
    private String descricao;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private TipoPlanoLeitura tipo;

    @NotNull
    @Column(name = "ativo", nullable = false)
    private Boolean ativo;

    @NotNull
    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm;

    @NotNull
    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "planoLeitura")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "plano", "planoLeitura" }, allowSetters = true)
    private Set<DiaPlanoLeitura> dias = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public PlanoLeitura id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return this.nome;
    }

    public PlanoLeitura nome(String nome) {
        this.setNome(nome);
        return this;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return this.descricao;
    }

    public PlanoLeitura descricao(String descricao) {
        this.setDescricao(descricao);
        return this;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public TipoPlanoLeitura getTipo() {
        return this.tipo;
    }

    public PlanoLeitura tipo(TipoPlanoLeitura tipo) {
        this.setTipo(tipo);
        return this;
    }

    public void setTipo(TipoPlanoLeitura tipo) {
        this.tipo = tipo;
    }

    public Boolean getAtivo() {
        return this.ativo;
    }

    public PlanoLeitura ativo(Boolean ativo) {
        this.setAtivo(ativo);
        return this;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public Instant getCriadoEm() {
        return this.criadoEm;
    }

    public PlanoLeitura criadoEm(Instant criadoEm) {
        this.setCriadoEm(criadoEm);
        return this;
    }

    public void setCriadoEm(Instant criadoEm) {
        this.criadoEm = criadoEm;
    }

    public Instant getAtualizadoEm() {
        return this.atualizadoEm;
    }

    public PlanoLeitura atualizadoEm(Instant atualizadoEm) {
        this.setAtualizadoEm(atualizadoEm);
        return this;
    }

    public void setAtualizadoEm(Instant atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }

    public Set<DiaPlanoLeitura> getDias() {
        return this.dias;
    }

    public void setDias(Set<DiaPlanoLeitura> diaPlanoLeituras) {
        if (this.dias != null) {
            this.dias.forEach(i -> i.setPlanoLeitura(null));
        }
        if (diaPlanoLeituras != null) {
            diaPlanoLeituras.forEach(i -> i.setPlanoLeitura(this));
        }
        this.dias = diaPlanoLeituras;
    }

    public PlanoLeitura dias(Set<DiaPlanoLeitura> diaPlanoLeituras) {
        this.setDias(diaPlanoLeituras);
        return this;
    }

    public PlanoLeitura addDias(DiaPlanoLeitura diaPlanoLeitura) {
        this.dias.add(diaPlanoLeitura);
        diaPlanoLeitura.setPlanoLeitura(this);
        return this;
    }

    public PlanoLeitura removeDias(DiaPlanoLeitura diaPlanoLeitura) {
        this.dias.remove(diaPlanoLeitura);
        diaPlanoLeitura.setPlanoLeitura(null);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof PlanoLeitura)) {
            return false;
        }
        return getId() != null && getId().equals(((PlanoLeitura) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "PlanoLeitura{" +
            "id=" + getId() +
            ", nome='" + getNome() + "'" +
            ", descricao='" + getDescricao() + "'" +
            ", tipo='" + getTipo() + "'" +
            ", ativo='" + getAtivo() + "'" +
            ", criadoEm='" + getCriadoEm() + "'" +
            ", atualizadoEm='" + getAtualizadoEm() + "'" +
            "}";
    }
}
