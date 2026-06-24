package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.CategoriaDocumentoIgreja;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;

public class DocumentoIgrejaDTO implements Serializable {

    private Long id;
    private Long igrejaId;
    private String nome;
    private String descricao;
    private CategoriaDocumentoIgreja categoria;
    private String nomeArquivoOriginal;
    private String tipoArquivo;
    private Long tamanhoArquivo;
    private String urlDownload;
    private LocalDate dataDocumento;
    private LocalDate dataValidade;
    private Instant dataUpload;
    private Instant dataAtualizacao;
    private Long usuarioUploadId;
    private String usuarioUploadNome;
    private Boolean ativo;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIgrejaId() {
        return igrejaId;
    }

    public void setIgrejaId(Long igrejaId) {
        this.igrejaId = igrejaId;
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

    public String getUrlDownload() {
        return urlDownload;
    }

    public void setUrlDownload(String urlDownload) {
        this.urlDownload = urlDownload;
    }

    public LocalDate getDataDocumento() {
        return dataDocumento;
    }

    public void setDataDocumento(LocalDate dataDocumento) {
        this.dataDocumento = dataDocumento;
    }

    public LocalDate getDataValidade() {
        return dataValidade;
    }

    public void setDataValidade(LocalDate dataValidade) {
        this.dataValidade = dataValidade;
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

    public Long getUsuarioUploadId() {
        return usuarioUploadId;
    }

    public void setUsuarioUploadId(Long usuarioUploadId) {
        this.usuarioUploadId = usuarioUploadId;
    }

    public String getUsuarioUploadNome() {
        return usuarioUploadNome;
    }

    public void setUsuarioUploadNome(String usuarioUploadNome) {
        this.usuarioUploadNome = usuarioUploadNome;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }
}
