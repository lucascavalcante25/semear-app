package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.CategoriaPedidoOracao;
import java.io.Serializable;

public class PedidoOracaoPublicoCriarDTO implements Serializable {

    private String nome;
    private String titulo;
    private String descricao;
    private CategoriaPedidoOracao categoria;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public CategoriaPedidoOracao getCategoria() { return categoria; }
    public void setCategoria(CategoriaPedidoOracao categoria) { this.categoria = categoria; }
}
