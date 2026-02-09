package br.com.semear.domain;

import br.com.semear.domain.enumeration.VersaoBiblia;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A FavoritoBiblia.
 */
@Entity
@Table(name = "favorito_biblia")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class FavoritoBiblia implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "chave_referencia", nullable = false, unique = true)
    private String chaveReferencia;

    @NotNull
    @Column(name = "livro_id", nullable = false)
    private String livroId;

    @NotNull
    @Column(name = "livro_nome", nullable = false)
    private String livroNome;

    @NotNull
    @Min(value = 1)
    @Column(name = "capitulo", nullable = false)
    private Integer capitulo;

    @NotNull
    @Min(value = 1)
    @Column(name = "versiculo_inicio", nullable = false)
    private Integer versiculoInicio;

    @NotNull
    @Min(value = 1)
    @Column(name = "versiculo_fim", nullable = false)
    private Integer versiculoFim;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "versao", nullable = false)
    private VersaoBiblia versao;

    @NotNull
    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm;

    @Column(name = "atualizado_em")
    private Instant atualizadoEm;

    @ManyToOne(fetch = FetchType.LAZY)
    private User usuario;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public FavoritoBiblia id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getChaveReferencia() {
        return this.chaveReferencia;
    }

    public FavoritoBiblia chaveReferencia(String chaveReferencia) {
        this.setChaveReferencia(chaveReferencia);
        return this;
    }

    public void setChaveReferencia(String chaveReferencia) {
        this.chaveReferencia = chaveReferencia;
    }

    public String getLivroId() {
        return this.livroId;
    }

    public FavoritoBiblia livroId(String livroId) {
        this.setLivroId(livroId);
        return this;
    }

    public void setLivroId(String livroId) {
        this.livroId = livroId;
    }

    public String getLivroNome() {
        return this.livroNome;
    }

    public FavoritoBiblia livroNome(String livroNome) {
        this.setLivroNome(livroNome);
        return this;
    }

    public void setLivroNome(String livroNome) {
        this.livroNome = livroNome;
    }

    public Integer getCapitulo() {
        return this.capitulo;
    }

    public FavoritoBiblia capitulo(Integer capitulo) {
        this.setCapitulo(capitulo);
        return this;
    }

    public void setCapitulo(Integer capitulo) {
        this.capitulo = capitulo;
    }

    public Integer getVersiculoInicio() {
        return this.versiculoInicio;
    }

    public FavoritoBiblia versiculoInicio(Integer versiculoInicio) {
        this.setVersiculoInicio(versiculoInicio);
        return this;
    }

    public void setVersiculoInicio(Integer versiculoInicio) {
        this.versiculoInicio = versiculoInicio;
    }

    public Integer getVersiculoFim() {
        return this.versiculoFim;
    }

    public FavoritoBiblia versiculoFim(Integer versiculoFim) {
        this.setVersiculoFim(versiculoFim);
        return this;
    }

    public void setVersiculoFim(Integer versiculoFim) {
        this.versiculoFim = versiculoFim;
    }

    public VersaoBiblia getVersao() {
        return this.versao;
    }

    public FavoritoBiblia versao(VersaoBiblia versao) {
        this.setVersao(versao);
        return this;
    }

    public void setVersao(VersaoBiblia versao) {
        this.versao = versao;
    }

    public Instant getCriadoEm() {
        return this.criadoEm;
    }

    public FavoritoBiblia criadoEm(Instant criadoEm) {
        this.setCriadoEm(criadoEm);
        return this;
    }

    public void setCriadoEm(Instant criadoEm) {
        this.criadoEm = criadoEm;
    }

    public Instant getAtualizadoEm() {
        return this.atualizadoEm;
    }

    public FavoritoBiblia atualizadoEm(Instant atualizadoEm) {
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

    public FavoritoBiblia usuario(User user) {
        this.setUsuario(user);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof FavoritoBiblia)) {
            return false;
        }
        return getId() != null && getId().equals(((FavoritoBiblia) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "FavoritoBiblia{" +
            "id=" + getId() +
            ", chaveReferencia='" + getChaveReferencia() + "'" +
            ", livroId='" + getLivroId() + "'" +
            ", livroNome='" + getLivroNome() + "'" +
            ", capitulo=" + getCapitulo() +
            ", versiculoInicio=" + getVersiculoInicio() +
            ", versiculoFim=" + getVersiculoFim() +
            ", versao='" + getVersao() + "'" +
            ", criadoEm='" + getCriadoEm() + "'" +
            ", atualizadoEm='" + getAtualizadoEm() + "'" +
            "}";
    }
}
