package br.com.semear.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
    name = "igreja_cargo",
    uniqueConstraints = { @UniqueConstraint(name = "uk_igreja_cargo_codigo", columnNames = { "igreja_id", "codigo" }) }
)
public class IgrejaCargo implements Serializable {

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
    @Size(max = 50)
    @Column(name = "codigo", nullable = false, length = 50)
    private String codigo;

    @NotNull
    @Size(max = 120)
    @Column(name = "nome", nullable = false, length = 120)
    private String nome;

    @Size(max = 500)
    @Column(name = "descricao", length = 500)
    private String descricao;

    @NotNull
    @Column(name = "sistema", nullable = false)
    private Boolean sistema = false;

    @NotNull
    @Column(name = "ordem", nullable = false)
    private Integer ordem = 0;

    @NotNull
    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm = Instant.now();

    @OneToMany(mappedBy = "cargo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "cargo", "hibernateLazyInitializer", "handler" }, allowSetters = true)
    private Set<IgrejaCargoModulo> modulos = new HashSet<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Igreja getIgreja() {
        return igreja;
    }

    public void setIgreja(Igreja igreja) {
        this.igreja = igreja;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
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

    public Boolean getSistema() {
        return sistema;
    }

    public void setSistema(Boolean sistema) {
        this.sistema = sistema;
    }

    public Integer getOrdem() {
        return ordem;
    }

    public void setOrdem(Integer ordem) {
        this.ordem = ordem;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(Instant criadoEm) {
        this.criadoEm = criadoEm;
    }

    public Set<IgrejaCargoModulo> getModulos() {
        return modulos;
    }

    public void setModulos(Set<IgrejaCargoModulo> modulos) {
        this.modulos = modulos;
    }
}
