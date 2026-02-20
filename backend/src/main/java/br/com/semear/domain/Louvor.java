package br.com.semear.domain;

import br.com.semear.domain.enumeration.TipoLouvor;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Entidade Louvor - cadastro de músicas do repertório.
 */
@Entity
@Table(name = "louvor")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@EntityListeners(AuditingEntityListener.class)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Louvor implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "titulo", nullable = false)
    private String titulo;

    @NotNull
    @Column(name = "artista", nullable = false)
    private String artista;

    @Column(name = "tonalidade", length = 20)
    private String tonalidade;

    @Column(name = "tempo", length = 50)
    private String tempo;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 50)
    private TipoLouvor tipo;

    @Column(name = "youtube_url", length = 500)
    private String youtubeUrl;

    @Column(name = "cifra_url", length = 500)
    private String cifraUrl;

    @Column(name = "cifra_conteudo", columnDefinition = "text")
    private String cifraConteudo;

    @Column(name = "cifra_file_name", length = 255)
    private String cifraFileName;

    @Column(name = "cifra_content_type", length = 100)
    private String cifraContentType;

    @Column(name = "observacoes", columnDefinition = "text")
    private String observacoes;

    @NotNull
    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getArtista() {
        return artista;
    }

    public void setArtista(String artista) {
        this.artista = artista;
    }

    public String getTonalidade() {
        return tonalidade;
    }

    public void setTonalidade(String tonalidade) {
        this.tonalidade = tonalidade;
    }

    public String getTempo() {
        return tempo;
    }

    public void setTempo(String tempo) {
        this.tempo = tempo;
    }

    public TipoLouvor getTipo() {
        return tipo;
    }

    public void setTipo(TipoLouvor tipo) {
        this.tipo = tipo;
    }

    public String getYoutubeUrl() {
        return youtubeUrl;
    }

    public void setYoutubeUrl(String youtubeUrl) {
        this.youtubeUrl = youtubeUrl;
    }

    public String getCifraUrl() {
        return cifraUrl;
    }

    public void setCifraUrl(String cifraUrl) {
        this.cifraUrl = cifraUrl;
    }

    public String getCifraConteudo() {
        return cifraConteudo;
    }

    public void setCifraConteudo(String cifraConteudo) {
        this.cifraConteudo = cifraConteudo;
    }

    public String getCifraFileName() {
        return cifraFileName;
    }

    public void setCifraFileName(String cifraFileName) {
        this.cifraFileName = cifraFileName;
    }

    public String getCifraContentType() {
        return cifraContentType;
    }

    public void setCifraContentType(String cifraContentType) {
        this.cifraContentType = cifraContentType;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Louvor)) return false;
        return id != null && id.equals(((Louvor) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Louvor{id=" + id + ", titulo='" + titulo + "', artista='" + artista + "'}";
    }
}
