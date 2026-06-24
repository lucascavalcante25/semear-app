package br.com.semear.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "informativo_leitura")
public class InformativoLeitura implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "informativo_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler" }, allowSetters = true)
    private Informativo informativo;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler", "password", "authorities" }, allowSetters = true)
    private User usuario;

    @NotNull
    @Column(name = "confirmado_em", nullable = false)
    private Instant confirmadoEm = Instant.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Informativo getInformativo() {
        return informativo;
    }

    public void setInformativo(Informativo informativo) {
        this.informativo = informativo;
    }

    public User getUsuario() {
        return usuario;
    }

    public void setUsuario(User usuario) {
        this.usuario = usuario;
    }

    public Instant getConfirmadoEm() {
        return confirmadoEm;
    }

    public void setConfirmadoEm(Instant confirmadoEm) {
        this.confirmadoEm = confirmadoEm;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof InformativoLeitura)) {
            return false;
        }
        return getId() != null && getId().equals(((InformativoLeitura) o).getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
