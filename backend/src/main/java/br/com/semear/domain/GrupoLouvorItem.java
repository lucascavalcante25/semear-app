package br.com.semear.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * Item de um grupo de louvores - associa louvor ao grupo com ordem.
 */
@Entity
@Table(name = "grupo_louvor_item", uniqueConstraints = {
    @UniqueConstraint(columnNames = { "grupo_id", "louvor_id" })
})
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class GrupoLouvorItem implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grupo_id", nullable = false)
    private GrupoLouvor grupo;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "louvor_id", nullable = false)
    private Louvor louvor;

    @NotNull
    @Column(name = "ordem", nullable = false)
    private Integer ordem = 0;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public GrupoLouvor getGrupo() {
        return grupo;
    }

    public void setGrupo(GrupoLouvor grupo) {
        this.grupo = grupo;
    }

    public Louvor getLouvor() {
        return louvor;
    }

    public void setLouvor(Louvor louvor) {
        this.louvor = louvor;
    }

    public Integer getOrdem() {
        return ordem;
    }

    public void setOrdem(Integer ordem) {
        this.ordem = ordem;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof GrupoLouvorItem)) return false;
        return id != null && id.equals(((GrupoLouvorItem) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
