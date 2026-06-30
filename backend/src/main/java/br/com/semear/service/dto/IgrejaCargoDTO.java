package br.com.semear.service.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class IgrejaCargoDTO implements Serializable {

    private Long id;
    private String codigo;
    private String nome;
    private String descricao;
    private Boolean sistema;
    private Integer ordem;
    private List<ModuloPermissaoDTO> modulos = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public List<ModuloPermissaoDTO> getModulos() {
        return modulos;
    }

    public void setModulos(List<ModuloPermissaoDTO> modulos) {
        this.modulos = modulos;
    }
}
