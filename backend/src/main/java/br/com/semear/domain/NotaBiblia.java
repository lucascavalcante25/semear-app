package br.com.semear.domain;

import br.com.semear.domain.enumeration.VersaoBiblia;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A NotaBiblia.
 */
@Entity
@Table(name = "nota_biblia")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class NotaBiblia implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "chave_referencia", nullable = false)
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

    @Lob
    @Column(name = "conteudo", nullable = false)
    private String conteudo;

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

    public NotaBiblia id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getChaveReferencia() {
        return this.chaveReferencia;
    }

    public NotaBiblia chaveReferencia(String chaveReferencia) {
        this.setChaveReferencia(chaveReferencia);
        return this;
    }

    public void setChaveReferencia(String chaveReferencia) {
        this.chaveReferencia = chaveReferencia;
    }

    public String getLivroId() {
        return this.livroId;
    }

    public NotaBiblia livroId(String livroId) {
        this.setLivroId(livroId);
        return this;
    }

    public void setLivroId(String livroId) {
        this.livroId = livroId;
    }

    public String getLivroNome() {
        return this.livroNome;
    }

    public NotaBiblia livroNome(String livroNome) {
        this.setLivroNome(livroNome);
        return this;
    }

    public void setLivroNome(String livroNome) {
        this.livroNome = livroNome;
    }

    public Integer getCapitulo() {
        return this.capitulo;
    }

    public NotaBiblia capitulo(Integer capitulo) {
        this.setCapitulo(capitulo);
        return this;
    }

    public void setCapitulo(Integer capitulo) {
        this.capitulo = capitulo;
    }

    public Integer getVersiculoInicio() {
        return this.versiculoInicio;
    }

    public NotaBiblia versiculoInicio(Integer versiculoInicio) {
        this.setVersiculoInicio(versiculoInicio);
        return this;
    }

    public void setVersiculoInicio(Integer versiculoInicio) {
        this.versiculoInicio = versiculoInicio;
    }

    public Integer getVersiculoFim() {
        return this.versiculoFim;
    }

    public NotaBiblia versiculoFim(Integer versiculoFim) {
        this.setVersiculoFim(versiculoFim);
        return this;
    }

    public void setVersiculoFim(Integer versiculoFim) {
        this.versiculoFim = versiculoFim;
    }

    public VersaoBiblia getVersao() {
        return this.versao;
    }

    public NotaBiblia versao(VersaoBiblia versao) {
        this.setVersao(versao);
        return this;
    }

    public void setVersao(VersaoBiblia versao) {
        this.versao = versao;
    }

    public String getConteudo() {
        return this.conteudo;
    }

    public NotaBiblia conteudo(String conteudo) {
        this.setConteudo(conteudo);
        return this;
    }

    public void setConteudo(String conteudo) {
        this.conteudo = conteudo;
    }

    public Instant getCriadoEm() {
        return this.criadoEm;
    }

    public NotaBiblia criadoEm(Instant criadoEm) {
        this.setCriadoEm(criadoEm);
        return this;
    }

    public void setCriadoEm(Instant criadoEm) {
        this.criadoEm = criadoEm;
    }

    public Instant getAtualizadoEm() {
        return this.atualizadoEm;
    }

    public NotaBiblia atualizadoEm(Instant atualizadoEm) {
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

    public NotaBiblia usuario(User user) {
        this.setUsuario(user);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof NotaBiblia)) {
            return false;
        }
        return getId() != null && getId().equals(((NotaBiblia) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "NotaBiblia{" +
            "id=" + getId() +
            ", chaveReferencia='" + getChaveReferencia() + "'" +
            ", livroId='" + getLivroId() + "'" +
            ", livroNome='" + getLivroNome() + "'" +
            ", capitulo=" + getCapitulo() +
            ", versiculoInicio=" + getVersiculoInicio() +
            ", versiculoFim=" + getVersiculoFim() +
            ", versao='" + getVersao() + "'" +
            ", conteudo='" + getConteudo() + "'" +
            ", criadoEm='" + getCriadoEm() + "'" +
            ", atualizadoEm='" + getAtualizadoEm() + "'" +
            "}";
    }
}
