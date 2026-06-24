package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.CategoriaPedidoOracao;
import br.com.semear.domain.enumeration.StatusPedidoOracao;
import br.com.semear.domain.enumeration.VisibilidadePedidoOracao;
import java.io.Serializable;
import java.time.Instant;

public class PedidoOracaoDTO implements Serializable {

    private Long id;
    private Long igrejaId;
    private Long usuarioId;
    private String usuarioNome;
    private String titulo;
    private String descricao;
    private CategoriaPedidoOracao categoria;
    private VisibilidadePedidoOracao visibilidade;
    private StatusPedidoOracao status;
    private Boolean anonimo;
    private Boolean requerAprovacao;
    private Boolean aprovado;
    private Long aprovadoPorId;
    private String aprovadoPorNome;
    private Instant aprovadoEm;
    private String respostaTexto;
    private Instant respondidoEm;
    private Instant criadoEm;
    private Instant atualizadoEm;
    private Long totalIntercessoes;
    private Boolean oreiPorMim;
    private String nomeSolicitante;
    private Boolean denunciado;
    private Instant denunciadoEm;
    private Long denunciadoPorId;
    private String denunciadoPorNome;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIgrejaId() {
        return igrejaId;
    }

    public void setIgrejaId(Long igrejaId) {
        this.igrejaId = igrejaId;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getUsuarioNome() {
        return usuarioNome;
    }

    public void setUsuarioNome(String usuarioNome) {
        this.usuarioNome = usuarioNome;
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

    public Long getAprovadoPorId() {
        return aprovadoPorId;
    }

    public void setAprovadoPorId(Long aprovadoPorId) {
        this.aprovadoPorId = aprovadoPorId;
    }

    public String getAprovadoPorNome() {
        return aprovadoPorNome;
    }

    public void setAprovadoPorNome(String aprovadoPorNome) {
        this.aprovadoPorNome = aprovadoPorNome;
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

    public Long getTotalIntercessoes() {
        return totalIntercessoes;
    }

    public void setTotalIntercessoes(Long totalIntercessoes) {
        this.totalIntercessoes = totalIntercessoes;
    }

    public Boolean getOreiPorMim() {
        return oreiPorMim;
    }

    public void setOreiPorMim(Boolean oreiPorMim) {
        this.oreiPorMim = oreiPorMim;
    }

    public String getNomeSolicitante() {
        return nomeSolicitante;
    }

    public void setNomeSolicitante(String nomeSolicitante) {
        this.nomeSolicitante = nomeSolicitante;
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

    public Long getDenunciadoPorId() {
        return denunciadoPorId;
    }

    public void setDenunciadoPorId(Long denunciadoPorId) {
        this.denunciadoPorId = denunciadoPorId;
    }

    public String getDenunciadoPorNome() {
        return denunciadoPorNome;
    }

    public void setDenunciadoPorNome(String denunciadoPorNome) {
        this.denunciadoPorNome = denunciadoPorNome;
    }
}
