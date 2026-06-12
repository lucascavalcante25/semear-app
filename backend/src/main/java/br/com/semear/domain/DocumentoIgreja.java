package br.com.semear.domain;

import br.com.semear.domain.enumeration.CategoriaDocumentoIgreja;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "documento_igreja")
public class DocumentoIgreja implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "igreja_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler" }, allowSetters = true)
    private Igreja igreja;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_upload_id")
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler", "password", "authorities" }, allowSetters = true)
    private User usuarioUpload;

    @NotNull
    @Size(max = 120)
    @Column(name = "nome", nullable = false, length = 120)
    private String nome;

    @Size(max = 500)
    @Column(name = "descricao", length = 500)
    private String descricao;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "categoria", nullable = false, length = 50)
    private CategoriaDocumentoIgreja categoria;

    @NotNull
    @Size(max = 255)
    @Column(name = "nome_arquivo_original", nullable = false, length = 255)
    private String nomeArquivoOriginal;

    @NotNull
    @Size(max = 255)
    @Column(name = "nome_arquivo_armazenado", nullable = false, length = 255)
    private String nomeArquivoArmazenado;

    @NotNull
    @Size(max = 100)
    @Column(name = "tipo_arquivo", nullable = false, length = 100)
    private String tipoArquivo;

    @NotNull
    @Column(name = "tamanho_arquivo", nullable = false)
    private Long tamanhoArquivo;

    @NotNull
    @Size(max = 500)
    @Column(name = "caminho_arquivo", nullable = false, length = 500)
    @JsonIgnore
    private String caminhoArquivo;

    @Column(name = "data_documento")
    private LocalDate dataDocumento;

    @NotNull
    @Column(name = "data_upload", nullable = false)
    private Instant dataUpload = Instant.now();

    @Column(name = "data_atualizacao")
    private Instant dataAtualizacao;

    @NotNull
    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Igreja getIgreja() {
        return igreja;
    }

    public void setIgreja(Igreja igreja) {
        this.igreja = igreja;
    }

    public User getUsuarioUpload() {
        return usuarioUpload;
    }

    public void setUsuarioUpload(User usuarioUpload) {
        this.usuarioUpload = usuarioUpload;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public CategoriaDocumentoIgreja getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaDocumentoIgreja categoria) {
        this.categoria = categoria;
    }

    public String getNomeArquivoOriginal() {
        return nomeArquivoOriginal;
    }

    public void setNomeArquivoOriginal(String nomeArquivoOriginal) {
        this.nomeArquivoOriginal = nomeArquivoOriginal;
    }

    public String getNomeArquivoArmazenado() {
        return nomeArquivoArmazenado;
    }

    public void setNomeArquivoArmazenado(String nomeArquivoArmazenado) {
        this.nomeArquivoArmazenado = nomeArquivoArmazenado;
    }

    public String getTipoArquivo() {
        return tipoArquivo;
    }

    public void setTipoArquivo(String tipoArquivo) {
        this.tipoArquivo = tipoArquivo;
    }

    public Long getTamanhoArquivo() {
        return tamanhoArquivo;
    }

    public void setTamanhoArquivo(Long tamanhoArquivo) {
        this.tamanhoArquivo = tamanhoArquivo;
    }

    public String getCaminhoArquivo() {
        return caminhoArquivo;
    }

    public void setCaminhoArquivo(String caminhoArquivo) {
        this.caminhoArquivo = caminhoArquivo;
    }

    public LocalDate getDataDocumento() {
        return dataDocumento;
    }

    public void setDataDocumento(LocalDate dataDocumento) {
        this.dataDocumento = dataDocumento;
    }

    public Instant getDataUpload() {
        return dataUpload;
    }

    public void setDataUpload(Instant dataUpload) {
        this.dataUpload = dataUpload;
    }

    public Instant getDataAtualizacao() {
        return dataAtualizacao;
    }

    public void setDataAtualizacao(Instant dataAtualizacao) {
        this.dataAtualizacao = dataAtualizacao;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof DocumentoIgreja)) {
            return false;
        }
        return getId() != null && getId().equals(((DocumentoIgreja) o).getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
