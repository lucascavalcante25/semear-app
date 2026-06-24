package br.com.semear.service.dto;

import java.io.Serializable;

public class DepartamentoMembroDTO implements Serializable {

    private Long id;
    private Long departamentoId;
    private Long userId;
    private String userNome;
    private String funcao;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getDepartamentoId() { return departamentoId; }
    public void setDepartamentoId(Long departamentoId) { this.departamentoId = departamentoId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserNome() { return userNome; }
    public void setUserNome(String userNome) { this.userNome = userNome; }
    public String getFuncao() { return funcao; }
    public void setFuncao(String funcao) { this.funcao = funcao; }
}
