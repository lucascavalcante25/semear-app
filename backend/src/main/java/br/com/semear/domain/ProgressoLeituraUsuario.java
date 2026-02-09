package br.com.semear.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A ProgressoLeituraUsuario.
 */
@Entity
@Table(name = "progresso_leitura_usuario")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ProgressoLeituraUsuario implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "data", nullable = false)
    private LocalDate data;

    @NotNull
    @Column(name = "concluido", nullable = false)
    private Boolean concluido;

    @Column(name = "concluido_em")
    private Instant concluidoEm;

    @NotNull
    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm;

    @NotNull
    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    @ManyToOne(fetch = FetchType.LAZY)
    private User usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "dias" }, allowSetters = true)
    private PlanoLeitura plano;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "plano", "planoLeitura" }, allowSetters = true)
    private DiaPlanoLeitura dia;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public ProgressoLeituraUsuario id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getData() {
        return this.data;
    }

    public ProgressoLeituraUsuario data(LocalDate data) {
        this.setData(data);
        return this;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public Boolean getConcluido() {
        return this.concluido;
    }

    public ProgressoLeituraUsuario concluido(Boolean concluido) {
        this.setConcluido(concluido);
        return this;
    }

    public void setConcluido(Boolean concluido) {
        this.concluido = concluido;
    }

    public Instant getConcluidoEm() {
        return this.concluidoEm;
    }

    public ProgressoLeituraUsuario concluidoEm(Instant concluidoEm) {
        this.setConcluidoEm(concluidoEm);
        return this;
    }

    public void setConcluidoEm(Instant concluidoEm) {
        this.concluidoEm = concluidoEm;
    }

    public Instant getCriadoEm() {
        return this.criadoEm;
    }

    public ProgressoLeituraUsuario criadoEm(Instant criadoEm) {
        this.setCriadoEm(criadoEm);
        return this;
    }

    public void setCriadoEm(Instant criadoEm) {
        this.criadoEm = criadoEm;
    }

    public Instant getAtualizadoEm() {
        return this.atualizadoEm;
    }

    public ProgressoLeituraUsuario atualizadoEm(Instant atualizadoEm) {
        this.setAtualizadoEm(atualizadoEm);
        return this;
    }

    public void setAtualizadoEm(Instant atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }

    public User getUsuario() {
        return this.usuario;
    }

    public void setUsuario(User user) {
        this.usuario = user;
    }

    public ProgressoLeituraUsuario usuario(User user) {
        this.setUsuario(user);
        return this;
    }

    public PlanoLeitura getPlano() {
        return this.plano;
    }

    public void setPlano(PlanoLeitura planoLeitura) {
        this.plano = planoLeitura;
    }

    public ProgressoLeituraUsuario plano(PlanoLeitura planoLeitura) {
        this.setPlano(planoLeitura);
        return this;
    }

    public DiaPlanoLeitura getDia() {
        return this.dia;
    }

    public void setDia(DiaPlanoLeitura diaPlanoLeitura) {
        this.dia = diaPlanoLeitura;
    }

    public ProgressoLeituraUsuario dia(DiaPlanoLeitura diaPlanoLeitura) {
        this.setDia(diaPlanoLeitura);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ProgressoLeituraUsuario)) {
            return false;
        }
        return getId() != null && getId().equals(((ProgressoLeituraUsuario) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ProgressoLeituraUsuario{" +
            "id=" + getId() +
            ", data='" + getData() + "'" +
            ", concluido='" + getConcluido() + "'" +
            ", concluidoEm='" + getConcluidoEm() + "'" +
            ", criadoEm='" + getCriadoEm() + "'" +
            ", atualizadoEm='" + getAtualizadoEm() + "'" +
            "}";
    }
}
