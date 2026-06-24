package br.com.semear.service.dto;

import java.io.Serializable;
import java.time.Instant;

public class EscalaItemDTO implements Serializable {

    private Long id;
    private Long escalaId;
    private Long userId;
    private String userNome;
    private String funcao;
    private Boolean confirmado;
    private Instant confirmadoEm;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getEscalaId() { return escalaId; }
    public void setEscalaId(Long escalaId) { this.escalaId = escalaId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserNome() { return userNome; }
    public void setUserNome(String userNome) { this.userNome = userNome; }
    public String getFuncao() { return funcao; }
    public void setFuncao(String funcao) { this.funcao = funcao; }
    public Boolean getConfirmado() { return confirmado; }
    public void setConfirmado(Boolean confirmado) { this.confirmado = confirmado; }
    public Instant getConfirmadoEm() { return confirmadoEm; }
    public void setConfirmadoEm(Instant confirmadoEm) { this.confirmadoEm = confirmadoEm; }
}
