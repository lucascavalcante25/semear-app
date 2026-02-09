package br.com.semear.domain;

import br.com.semear.domain.enumeration.ModoBiblia;
import br.com.semear.domain.enumeration.TamanhoFonte;
import br.com.semear.domain.enumeration.Tema;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A PreferenciaBibliaUsuario.
 */
@Entity
@Table(name = "preferencia_biblia_usuario")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PreferenciaBibliaUsuario implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "modo", nullable = false)
    private ModoBiblia modo;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tamanho_fonte", nullable = false)
    private TamanhoFonte tamanhoFonte;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tema", nullable = false)
    private Tema tema;

    @NotNull
    @Column(name = "mostrar_destaques", nullable = false)
    private Boolean mostrarDestaques;

    @NotNull
    @Column(name = "mostrar_notas", nullable = false)
    private Boolean mostrarNotas;

    @NotNull
    @Column(name = "mostrar_favoritos", nullable = false)
    private Boolean mostrarFavoritos;

    @NotNull
    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm;

    @NotNull
    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    @ManyToOne(fetch = FetchType.LAZY)
    private User usuario;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public PreferenciaBibliaUsuario id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ModoBiblia getModo() {
        return this.modo;
    }

    public PreferenciaBibliaUsuario modo(ModoBiblia modo) {
        this.setModo(modo);
        return this;
    }

    public void setModo(ModoBiblia modo) {
        this.modo = modo;
    }

    public TamanhoFonte getTamanhoFonte() {
        return this.tamanhoFonte;
    }

    public PreferenciaBibliaUsuario tamanhoFonte(TamanhoFonte tamanhoFonte) {
        this.setTamanhoFonte(tamanhoFonte);
        return this;
    }

    public void setTamanhoFonte(TamanhoFonte tamanhoFonte) {
        this.tamanhoFonte = tamanhoFonte;
    }

    public Tema getTema() {
        return this.tema;
    }

    public PreferenciaBibliaUsuario tema(Tema tema) {
        this.setTema(tema);
        return this;
    }

    public void setTema(Tema tema) {
        this.tema = tema;
    }

    public Boolean getMostrarDestaques() {
        return this.mostrarDestaques;
    }

    public PreferenciaBibliaUsuario mostrarDestaques(Boolean mostrarDestaques) {
        this.setMostrarDestaques(mostrarDestaques);
        return this;
    }

    public void setMostrarDestaques(Boolean mostrarDestaques) {
        this.mostrarDestaques = mostrarDestaques;
    }

    public Boolean getMostrarNotas() {
        return this.mostrarNotas;
    }

    public PreferenciaBibliaUsuario mostrarNotas(Boolean mostrarNotas) {
        this.setMostrarNotas(mostrarNotas);
        return this;
    }

    public void setMostrarNotas(Boolean mostrarNotas) {
        this.mostrarNotas = mostrarNotas;
    }

    public Boolean getMostrarFavoritos() {
        return this.mostrarFavoritos;
    }

    public PreferenciaBibliaUsuario mostrarFavoritos(Boolean mostrarFavoritos) {
        this.setMostrarFavoritos(mostrarFavoritos);
        return this;
    }

    public void setMostrarFavoritos(Boolean mostrarFavoritos) {
        this.mostrarFavoritos = mostrarFavoritos;
    }

    public Instant getCriadoEm() {
        return this.criadoEm;
    }

    public PreferenciaBibliaUsuario criadoEm(Instant criadoEm) {
        this.setCriadoEm(criadoEm);
        return this;
    }

    public void setCriadoEm(Instant criadoEm) {
        this.criadoEm = criadoEm;
    }

    public Instant getAtualizadoEm() {
        return this.atualizadoEm;
    }

    public PreferenciaBibliaUsuario atualizadoEm(Instant atualizadoEm) {
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

    public PreferenciaBibliaUsuario usuario(User user) {
        this.setUsuario(user);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof PreferenciaBibliaUsuario)) {
            return false;
        }
        return getId() != null && getId().equals(((PreferenciaBibliaUsuario) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "PreferenciaBibliaUsuario{" +
            "id=" + getId() +
            ", modo='" + getModo() + "'" +
            ", tamanhoFonte='" + getTamanhoFonte() + "'" +
            ", tema='" + getTema() + "'" +
            ", mostrarDestaques='" + getMostrarDestaques() + "'" +
            ", mostrarNotas='" + getMostrarNotas() + "'" +
            ", mostrarFavoritos='" + getMostrarFavoritos() + "'" +
            ", criadoEm='" + getCriadoEm() + "'" +
            ", atualizadoEm='" + getAtualizadoEm() + "'" +
            "}";
    }
}
