package br.com.semear.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "notificacao_usuario")
public class NotificacaoUsuario implements Serializable {

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

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler", "password", "authorities" }, allowSetters = true)
    private User user;

    @NotNull
    @Column(name = "titulo", nullable = false, length = 200)
    private String titulo;

    @Column(name = "mensagem", length = 500)
    private String mensagem;

    @NotNull
    @Column(name = "tipo", nullable = false, length = 50)
    private String tipo;

    @NotNull
    @Column(name = "lida", nullable = false)
    private Boolean lida = false;

    @NotNull
    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm = Instant.now();

    @Column(name = "link", length = 300)
    private String link;

    @Column(name = "entidade_tipo", length = 50)
    private String entidadeTipo;

    @Column(name = "entidade_id")
    private Long entidadeId;

    @NotNull
    @Column(name = "enviada_push", nullable = false)
    private Boolean enviadaPush = false;

    @Column(name = "data_envio_push")
    private Instant dataEnvioPush;

    @Column(name = "erro_push", length = 300)
    private String erroPush;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Igreja getIgreja() { return igreja; }
    public void setIgreja(Igreja igreja) { this.igreja = igreja; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getMensagem() { return mensagem; }
    public void setMensagem(String mensagem) { this.mensagem = mensagem; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public Boolean getLida() { return lida; }
    public void setLida(Boolean lida) { this.lida = lida; }
    public Instant getCriadoEm() { return criadoEm; }
    public void setCriadoEm(Instant criadoEm) { this.criadoEm = criadoEm; }
    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }
    public String getEntidadeTipo() { return entidadeTipo; }
    public void setEntidadeTipo(String entidadeTipo) { this.entidadeTipo = entidadeTipo; }
    public Long getEntidadeId() { return entidadeId; }
    public void setEntidadeId(Long entidadeId) { this.entidadeId = entidadeId; }
    public Boolean getEnviadaPush() { return enviadaPush; }
    public void setEnviadaPush(Boolean enviadaPush) { this.enviadaPush = enviadaPush; }
    public Instant getDataEnvioPush() { return dataEnvioPush; }
    public void setDataEnvioPush(Instant dataEnvioPush) { this.dataEnvioPush = dataEnvioPush; }
    public String getErroPush() { return erroPush; }
    public void setErroPush(String erroPush) { this.erroPush = erroPush; }
}
