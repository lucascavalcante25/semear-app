package br.com.semear.domain;

import br.com.semear.domain.enumeration.VersaoBiblia;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A HistoricoLeituraBiblia.
 */
@Entity
@Table(name = "historico_leitura_biblia")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class HistoricoLeituraBiblia implements Serializable {

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
    @Column(name = "lido_em", nullable = false)
    private Instant lidoEm;

    @ManyToOne(fetch = FetchType.LAZY)
    private User usuario;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public HistoricoLeituraBiblia id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLivroId() {
        return this.livroId;
    }

    public HistoricoLeituraBiblia livroId(String livroId) {
        this.setLivroId(livroId);
        return this;
    }

    public void setLivroId(String livroId) {
        this.livroId = livroId;
    }

    public String getLivroNome() {
        return this.livroNome;
    }

    public HistoricoLeituraBiblia livroNome(String livroNome) {
        this.setLivroNome(livroNome);
        return this;
    }

    public void setLivroNome(String livroNome) {
        this.livroNome = livroNome;
    }

    public Integer getCapitulo() {
        return this.capitulo;
    }

    public HistoricoLeituraBiblia capitulo(Integer capitulo) {
        this.setCapitulo(capitulo);
        return this;
    }

    public void setCapitulo(Integer capitulo) {
        this.capitulo = capitulo;
    }

    public Integer getVersiculoInicio() {
        return this.versiculoInicio;
    }

    public HistoricoLeituraBiblia versiculoInicio(Integer versiculoInicio) {
        this.setVersiculoInicio(versiculoInicio);
        return this;
    }

    public void setVersiculoInicio(Integer versiculoInicio) {
        this.versiculoInicio = versiculoInicio;
    }

    public Integer getVersiculoFim() {
        return this.versiculoFim;
    }

    public HistoricoLeituraBiblia versiculoFim(Integer versiculoFim) {
        this.setVersiculoFim(versiculoFim);
        return this;
    }

    public void setVersiculoFim(Integer versiculoFim) {
        this.versiculoFim = versiculoFim;
    }

    public VersaoBiblia getVersao() {
        return this.versao;
    }

    public HistoricoLeituraBiblia versao(VersaoBiblia versao) {
        this.setVersao(versao);
        return this;
    }

    public void setVersao(VersaoBiblia versao) {
        this.versao = versao;
    }

    public Instant getLidoEm() {
        return this.lidoEm;
    }

    public HistoricoLeituraBiblia lidoEm(Instant lidoEm) {
        this.setLidoEm(lidoEm);
        return this;
    }

    public void setLidoEm(Instant lidoEm) {
        this.lidoEm = lidoEm;
    }

    public User getUsuario() {
        return this.usuario;
    }

    public void setUsuario(User user) {
        this.usuario = user;
    }

    public HistoricoLeituraBiblia usuario(User user) {
        this.setUsuario(user);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof HistoricoLeituraBiblia)) {
            return false;
        }
        return getId() != null && getId().equals(((HistoricoLeituraBiblia) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "HistoricoLeituraBiblia{" +
            "id=" + getId() +
            ", livroId='" + getLivroId() + "'" +
            ", livroNome='" + getLivroNome() + "'" +
            ", capitulo=" + getCapitulo() +
            ", versiculoInicio=" + getVersiculoInicio() +
            ", versiculoFim=" + getVersiculoFim() +
            ", versao='" + getVersao() + "'" +
            ", lidoEm='" + getLidoEm() + "'" +
            "}";
    }
}
