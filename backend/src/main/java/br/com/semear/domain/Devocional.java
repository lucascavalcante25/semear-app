package br.com.semear.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * A Devocional.
 */
@Entity
@Table(name = "devocional")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@EntityListeners(AuditingEntityListener.class)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Devocional implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "titulo", nullable = false)
    private String titulo;

    @NotNull
    @Column(name = "versiculo_base", nullable = false)
    private String versiculoBase;

    @NotNull
    @Column(name = "texto_versiculo", nullable = false, columnDefinition = "text")
    private String textoVersiculo;

    @NotNull
    @Column(name = "conteudo", nullable = false, columnDefinition = "text")
    private String conteudo;

    @NotNull
    @Column(name = "data_publicacao", nullable = false)
    private LocalDate dataPublicacao;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    public Long getId() {
        return this.id;
    }

    public Devocional id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return this.titulo;
    }

    public Devocional titulo(String titulo) {
        this.setTitulo(titulo);
        return this;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getVersiculoBase() {
        return this.versiculoBase;
    }

    public Devocional versiculoBase(String versiculoBase) {
        this.setVersiculoBase(versiculoBase);
        return this;
    }

    public void setVersiculoBase(String versiculoBase) {
        this.versiculoBase = versiculoBase;
    }

    public String getTextoVersiculo() {
        return this.textoVersiculo;
    }

    public Devocional textoVersiculo(String textoVersiculo) {
        this.setTextoVersiculo(textoVersiculo);
        return this;
    }

    public void setTextoVersiculo(String textoVersiculo) {
        this.textoVersiculo = textoVersiculo;
    }

    public String getConteudo() {
        return this.conteudo;
    }

    public Devocional conteudo(String conteudo) {
        this.setConteudo(conteudo);
        return this;
    }

    public void setConteudo(String conteudo) {
        this.conteudo = conteudo;
    }

    public LocalDate getDataPublicacao() {
        return this.dataPublicacao;
    }

    public Devocional dataPublicacao(LocalDate dataPublicacao) {
        this.setDataPublicacao(dataPublicacao);
        return this;
    }

    public void setDataPublicacao(LocalDate dataPublicacao) {
        this.dataPublicacao = dataPublicacao;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return this.updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Devocional)) {
            return false;
        }
        return id != null && id.equals(((Devocional) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Devocional{" +
            "id=" + getId() +
            ", titulo='" + getTitulo() + "'" +
            ", versiculoBase='" + getVersiculoBase() + "'" +
            ", dataPublicacao='" + getDataPublicacao() + "'" +
            "}";
    }
}
