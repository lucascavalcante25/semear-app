package br.com.semear.domain;

import br.com.semear.domain.enumeration.TipoSolicitacaoSuporteMensagem;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "solicitacao_suporte_mensagem")
public class SolicitacaoSuporteMensagem implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitacao_suporte_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler" }, allowSetters = true)
    private SolicitacaoSuporte solicitacaoSuporte;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler", "password", "authorities" }, allowSetters = true)
    private User usuario;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 30)
    private TipoSolicitacaoSuporteMensagem tipo;

    @NotNull
    @Column(name = "texto", nullable = false, columnDefinition = "text")
    private String texto;

    @NotNull
    @Column(name = "data_envio", nullable = false)
    private Instant dataEnvio = Instant.now();

    @Size(max = 120)
    @Column(name = "usuario_nome", length = 120)
    private String usuarioNome;

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

    public User getUsuario() {
        return usuario;
    }

    public void setUsuario(User usuario) {
        this.usuario = usuario;
    }

    public TipoSolicitacaoSuporteMensagem getTipo() {
        return tipo;
    }

    public void setTipo(TipoSolicitacaoSuporteMensagem tipo) {
        this.tipo = tipo;
    }

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }

    public Instant getDataEnvio() {
        return dataEnvio;
    }

    public void setDataEnvio(Instant dataEnvio) {
        this.dataEnvio = dataEnvio;
    }

    public String getUsuarioNome() {
        return usuarioNome;
    }

    public void setUsuarioNome(String usuarioNome) {
        this.usuarioNome = usuarioNome;
    }
}
