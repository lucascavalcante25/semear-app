package br.com.semear.service.dto;

import java.io.Serializable;

public class PedidoOracaoCriarDTO implements Serializable {

    private String titulo;
    private String descricao;
    private br.com.semear.domain.enumeration.CategoriaPedidoOracao categoria;
    private br.com.semear.domain.enumeration.VisibilidadePedidoOracao visibilidade;
    private Boolean anonimo;

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

    public br.com.semear.domain.enumeration.CategoriaPedidoOracao getCategoria() {
        return categoria;
    }

    public void setCategoria(br.com.semear.domain.enumeration.CategoriaPedidoOracao categoria) {
        this.categoria = categoria;
    }

    public br.com.semear.domain.enumeration.VisibilidadePedidoOracao getVisibilidade() {
        return visibilidade;
    }

    public void setVisibilidade(br.com.semear.domain.enumeration.VisibilidadePedidoOracao visibilidade) {
        this.visibilidade = visibilidade;
    }

    public Boolean getAnonimo() {
        return anonimo;
    }

    public void setAnonimo(Boolean anonimo) {
        this.anonimo = anonimo;
    }
}
