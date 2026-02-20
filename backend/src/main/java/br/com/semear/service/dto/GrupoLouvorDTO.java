package br.com.semear.service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class GrupoLouvorDTO implements Serializable {

    private Long id;

    @NotBlank
    private String nome;

    @NotNull
    private Integer ordem = 0;

    private List<Long> louvorIds = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Integer getOrdem() {
        return ordem;
    }

    public void setOrdem(Integer ordem) {
        this.ordem = ordem;
    }

    public List<Long> getLouvorIds() {
        return louvorIds;
    }

    public void setLouvorIds(List<Long> louvorIds) {
        this.louvorIds = louvorIds != null ? louvorIds : new ArrayList<>();
    }
}
