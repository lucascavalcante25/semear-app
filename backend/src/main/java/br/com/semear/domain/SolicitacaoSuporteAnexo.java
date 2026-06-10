package br.com.semear.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "solicitacao_suporte_anexo")
public class SolicitacaoSuporteAnexo implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitacao_suporte_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler", "anexos" }, allowSetters = true)
    private SolicitacaoSuporte solicitacaoSuporte;

    @NotNull
    @Size(max = 255)
    @Column(name = "nome_arquivo", nullable = false)
    private String nomeArquivo;

    @NotNull
    @Size(max = 100)
    @Column(name = "tipo_arquivo", nullable = false, length = 100)
    private String tipoArquivo;

    @NotNull
    @Column(name = "tamanho_arquivo", nullable = false)
    private Long tamanhoArquivo;

    @NotNull
    @Size(max = 500)
    @Column(name = "caminho_armazenamento", nullable = false, length = 500)
    private String caminhoArmazenamento;

    @NotNull
    @Column(name = "data_upload", nullable = false)
    private Instant dataUpload = Instant.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enviado_por_id")
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler", "password", "authorities" }, allowSetters = true)
    private User enviadoPor;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SolicitacaoSuporte getSolicitacaoSuporte() {
        return solicitacaoSuporte;
    }

    public void setSolicitacaoSuporte(SolicitacaoSuporte solicitacaoSuporte) {
        this.solicitacaoSuporte = solicitacaoSuporte;
    }

    public String getNomeArquivo() {
        return nomeArquivo;
    }

    public void setNomeArquivo(String nomeArquivo) {
        this.nomeArquivo = nomeArquivo;
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

    public String getCaminhoArmazenamento() {
        return caminhoArmazenamento;
    }

    public void setCaminhoArmazenamento(String caminhoArmazenamento) {
        this.caminhoArmazenamento = caminhoArmazenamento;
    }

    public Instant getDataUpload() {
        return dataUpload;
    }

    public void setDataUpload(Instant dataUpload) {
        this.dataUpload = dataUpload;
    }

    public User getEnviadoPor() {
        return enviadoPor;
    }

    public void setEnviadoPor(User enviadoPor) {
        this.enviadoPor = enviadoPor;
    }
}
