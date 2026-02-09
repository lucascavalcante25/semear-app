package br.com.semear.domain;

import br.com.semear.domain.enumeration.VersaoBiblia;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A CapituloBibliaCache.
 */
@Entity
@Table(name = "capitulo_biblia_cache")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class CapituloBibliaCache implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

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
    @Enumerated(EnumType.STRING)
    @Column(name = "versao", nullable = false)
    private VersaoBiblia versao;

    @Lob
    @Column(name = "versiculos_json", nullable = false)
    private String versiculosJson;

    @NotNull
    @Column(name = "cacheado_em", nullable = false)
    private Instant cacheadoEm;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public CapituloBibliaCache id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLivroId() {
        return this.livroId;
    }

    public CapituloBibliaCache livroId(String livroId) {
        this.setLivroId(livroId);
        return this;
    }

    public void setLivroId(String livroId) {
        this.livroId = livroId;
    }

    public String getLivroNome() {
        return this.livroNome;
    }

    public CapituloBibliaCache livroNome(String livroNome) {
        this.setLivroNome(livroNome);
        return this;
    }

    public void setLivroNome(String livroNome) {
        this.livroNome = livroNome;
    }

    public Integer getCapitulo() {
        return this.capitulo;
    }

    public CapituloBibliaCache capitulo(Integer capitulo) {
        this.setCapitulo(capitulo);
        return this;
    }

    public void setCapitulo(Integer capitulo) {
        this.capitulo = capitulo;
    }

    public VersaoBiblia getVersao() {
        return this.versao;
    }

    public CapituloBibliaCache versao(VersaoBiblia versao) {
        this.setVersao(versao);
        return this;
    }

    public void setVersao(VersaoBiblia versao) {
        this.versao = versao;
    }

    public String getVersiculosJson() {
        return this.versiculosJson;
    }

    public CapituloBibliaCache versiculosJson(String versiculosJson) {
        this.setVersiculosJson(versiculosJson);
        return this;
    }

    public void setVersiculosJson(String versiculosJson) {
        this.versiculosJson = versiculosJson;
    }

    public Instant getCacheadoEm() {
        return this.cacheadoEm;
    }

    public CapituloBibliaCache cacheadoEm(Instant cacheadoEm) {
        this.setCacheadoEm(cacheadoEm);
        return this;
    }

    public void setCacheadoEm(Instant cacheadoEm) {
        this.cacheadoEm = cacheadoEm;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CapituloBibliaCache)) {
            return false;
        }
        return getId() != null && getId().equals(((CapituloBibliaCache) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "CapituloBibliaCache{" +
            "id=" + getId() +
            ", livroId='" + getLivroId() + "'" +
            ", livroNome='" + getLivroNome() + "'" +
            ", capitulo=" + getCapitulo() +
            ", versao='" + getVersao() + "'" +
            ", versiculosJson='" + getVersiculosJson() + "'" +
            ", cacheadoEm='" + getCacheadoEm() + "'" +
            "}";
    }
}
