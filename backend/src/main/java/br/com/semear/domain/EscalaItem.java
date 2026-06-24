package br.com.semear.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "escala_item")
public class EscalaItem implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "escala_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler" }, allowSetters = true)
    private Escala escala;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler", "password", "authorities" }, allowSetters = true)
    private User user;

    @Column(name = "funcao", length = 100)
    private String funcao;

    @NotNull
    @Column(name = "confirmado", nullable = false)
    private Boolean confirmado = false;

    @Column(name = "confirmado_em")
    private Instant confirmadoEm;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Escala getEscala() { return escala; }
    public void setEscala(Escala escala) { this.escala = escala; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getFuncao() { return funcao; }
    public void setFuncao(String funcao) { this.funcao = funcao; }
    public Boolean getConfirmado() { return confirmado; }
    public void setConfirmado(Boolean confirmado) { this.confirmado = confirmado; }
    public Instant getConfirmadoEm() { return confirmadoEm; }
    public void setConfirmadoEm(Instant confirmadoEm) { this.confirmadoEm = confirmadoEm; }
}
