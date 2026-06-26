package br.com.semear.domain;

import br.com.semear.domain.enumeration.PlataformaPush;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(
    name = "usuario_dispositivo_push",
    uniqueConstraints = @UniqueConstraint(name = "uk_dispositivo_push_user_token", columnNames = { "user_id", "token" })
)
public class UsuarioDispositivoPush implements Serializable {

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
    @Column(name = "token", nullable = false, length = 500)
    private String token;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "plataforma", nullable = false, length = 20)
    private PlataformaPush plataforma = PlataformaPush.DESCONHECIDO;

    @Column(name = "navegador", length = 80)
    private String navegador;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @NotNull
    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @NotNull
    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm = Instant.now();

    @NotNull
    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm = Instant.now();

    @Column(name = "ultimo_uso")
    private Instant ultimoUso;

    @Column(name = "desativado_em")
    private Instant desativadoEm;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Igreja getIgreja() { return igreja; }
    public void setIgreja(Igreja igreja) { this.igreja = igreja; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public PlataformaPush getPlataforma() { return plataforma; }
    public void setPlataforma(PlataformaPush plataforma) { this.plataforma = plataforma; }
    public String getNavegador() { return navegador; }
    public void setNavegador(String navegador) { this.navegador = navegador; }
    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
    public Instant getCriadoEm() { return criadoEm; }
    public void setCriadoEm(Instant criadoEm) { this.criadoEm = criadoEm; }
    public Instant getAtualizadoEm() { return atualizadoEm; }
    public void setAtualizadoEm(Instant atualizadoEm) { this.atualizadoEm = atualizadoEm; }
    public Instant getUltimoUso() { return ultimoUso; }
    public void setUltimoUso(Instant ultimoUso) { this.ultimoUso = ultimoUso; }
    public Instant getDesativadoEm() { return desativadoEm; }
    public void setDesativadoEm(Instant desativadoEm) { this.desativadoEm = desativadoEm; }
}
