package br.com.semear.domain;

import br.com.semear.domain.enumeration.CategoriaPedidoOracao;
import br.com.semear.domain.enumeration.StatusPedidoOracao;
import br.com.semear.domain.enumeration.VisibilidadePedidoOracao;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "pedido_oracao")
public class PedidoOracao implements Serializable {

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler", "password", "authorities" }, allowSetters = true)
    private User usuario;

    @Size(max = 150)
    @Column(name = "nome_solicitante", length = 150)
    private String nomeSolicitante;

    @NotNull
    @Size(max = 120)
    @Column(name = "titulo", nullable = false, length = 120)
    private String titulo;

    @NotNull
    @Column(name = "descricao", nullable = false, columnDefinition = "text")
    private String descricao;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "categoria", nullable = false, length = 30)
    private CategoriaPedidoOracao categoria;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "visibilidade", nullable = false, length = 20)
    private VisibilidadePedidoOracao visibilidade;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private StatusPedidoOracao status = StatusPedidoOracao.ABERTO;

    @NotNull
    @Column(name = "anonimo", nullable = false)
    private Boolean anonimo = false;

    @NotNull
    @Column(name = "requer_aprovacao", nullable = false)
    private Boolean requerAprovacao = false;

    @NotNull
    @Column(name = "aprovado", nullable = false)
    private Boolean aprovado = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aprovado_por_id")
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler", "password", "authorities" }, allowSetters = true)
    private User aprovadoPor;

    @Column(name = "aprovado_em")
    private Instant aprovadoEm;

    @Column(name = "resposta_texto", columnDefinition = "text")
    private String respostaTexto;

    @Column(name = "respondido_em")
    private Instant respondidoEm;

    @NotNull
    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm = Instant.now();

    @Column(name = "atualizado_em")
    private Instant atualizadoEm;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @NotNull
    @Column(name = "denunciado", nullable = false)
    private Boolean denunciado = false;

    @Column(name = "denunciado_em")
    private Instant denunciadoEm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "denunciado_por_id")
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler", "password", "authorities" }, allowSetters = true)
    private User denunciadoPor;

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

    public User getUsuario() {
        return usuario;
    }

    public void setUsuario(User usuario) {
        this.usuario = usuario;
    }

    public String getNomeSolicitante() {
        return nomeSolicitante;
    }

    public void setNomeSolicitante(String nomeSolicitante) {
        this.nomeSolicitante = nomeSolicitante;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public CategoriaPedidoOracao getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaPedidoOracao categoria) {
        this.categoria = categoria;
    }

    public VisibilidadePedidoOracao getVisibilidade() {
        return visibilidade;
    }

    public void setVisibilidade(VisibilidadePedidoOracao visibilidade) {
        this.visibilidade = visibilidade;
    }

    public StatusPedidoOracao getStatus() {
        return status;
    }

    public void setStatus(StatusPedidoOracao status) {
        this.status = status;
    }

    public Boolean getAnonimo() {
        return anonimo;
    }

    public void setAnonimo(Boolean anonimo) {
        this.anonimo = anonimo;
    }

    public Boolean getRequerAprovacao() {
        return requerAprovacao;
    }

    public void setRequerAprovacao(Boolean requerAprovacao) {
        this.requerAprovacao = requerAprovacao;
    }

    public Boolean getAprovado() {
        return aprovado;
    }

    public void setAprovado(Boolean aprovado) {
        this.aprovado = aprovado;
    }

    public User getAprovadoPor() {
        return aprovadoPor;
    }

    public void setAprovadoPor(User aprovadoPor) {
        this.aprovadoPor = aprovadoPor;
    }

    public Instant getAprovadoEm() {
        return aprovadoEm;
    }

    public void setAprovadoEm(Instant aprovadoEm) {
        this.aprovadoEm = aprovadoEm;
    }

    public String getRespostaTexto() {
        return respostaTexto;
    }

    public void setRespostaTexto(String respostaTexto) {
        this.respostaTexto = respostaTexto;
    }

    public Instant getRespondidoEm() {
        return respondidoEm;
    }

    public void setRespondidoEm(Instant respondidoEm) {
        this.respondidoEm = respondidoEm;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(Instant criadoEm) {
        this.criadoEm = criadoEm;
    }

    public Instant getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setAtualizadoEm(Instant atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }

    public Instant getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(Instant deletedAt) {
        this.deletedAt = deletedAt;
    }

    public Boolean getDenunciado() {
        return denunciado;
    }

    public void setDenunciado(Boolean denunciado) {
        this.denunciado = denunciado;
    }

    public Instant getDenunciadoEm() {
        return denunciadoEm;
    }

    public void setDenunciadoEm(Instant denunciadoEm) {
        this.denunciadoEm = denunciadoEm;
    }

    public User getDenunciadoPor() {
        return denunciadoPor;
    }

    public void setDenunciadoPor(User denunciadoPor) {
        this.denunciadoPor = denunciadoPor;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof PedidoOracao)) {
            return false;
        }
        return getId() != null && getId().equals(((PedidoOracao) o).getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
