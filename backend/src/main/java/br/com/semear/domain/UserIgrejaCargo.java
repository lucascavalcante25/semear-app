package br.com.semear.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(
    name = "user_igreja_cargo",
    uniqueConstraints = { @UniqueConstraint(name = "uk_user_igreja_cargo", columnNames = { "user_id", "cargo_id" }) }
)
public class UserIgrejaCargo implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler", "password", "authorities" }, allowSetters = true)
    private User user;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cargo_id", nullable = false)
    @JsonIgnoreProperties(value = { "modulos", "igreja", "hibernateLazyInitializer", "handler" }, allowSetters = true)
    private IgrejaCargo cargo;

    @NotNull
    @Column(name = "atribuido_em", nullable = false)
    private Instant atribuidoEm = Instant.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public IgrejaCargo getCargo() {
        return cargo;
    }

    public void setCargo(IgrejaCargo cargo) {
        this.cargo = cargo;
    }

    public Instant getAtribuidoEm() {
        return atribuidoEm;
    }

    public void setAtribuidoEm(Instant atribuidoEm) {
        this.atribuidoEm = atribuidoEm;
    }
}
