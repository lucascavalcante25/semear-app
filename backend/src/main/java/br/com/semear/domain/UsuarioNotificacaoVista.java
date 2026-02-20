package br.com.semear.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * Registra quando um usuário visualizou uma notificação (aviso ou aniversariante).
 */
@Entity
@Table(
    name = "usuario_notificacao_vista",
    uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "tipo", "referencia_id" })
)
public class UsuarioNotificacaoVista implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seqUsuarioNotificacaoVista")
    @SequenceGenerator(name = "seqUsuarioNotificacaoVista", sequenceName = "seq_usuario_notificacao_vista", allocationSize = 1)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @Column(name = "tipo", nullable = false, length = 50)
    private String tipo;

    @NotNull
    @Column(name = "referencia_id", nullable = false)
    private Long referenciaId;

    @NotNull
    @Column(name = "visto_em", nullable = false)
    private Instant vistoEm;

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

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Long getReferenciaId() {
        return referenciaId;
    }

    public void setReferenciaId(Long referenciaId) {
        this.referenciaId = referenciaId;
    }

    public Instant getVistoEm() {
        return vistoEm;
    }

    public void setVistoEm(Instant vistoEm) {
        this.vistoEm = vistoEm;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UsuarioNotificacaoVista)) return false;
        UsuarioNotificacaoVista that = (UsuarioNotificacaoVista) o;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
