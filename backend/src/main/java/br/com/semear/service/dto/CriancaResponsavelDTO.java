package br.com.semear.service.dto;

import java.io.Serializable;

public class CriancaResponsavelDTO implements Serializable {

    private Long id;
    private Long criancaId;
    private Long userId;
    private String userNome;
    private String parentesco;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCriancaId() { return criancaId; }
    public void setCriancaId(Long criancaId) { this.criancaId = criancaId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserNome() { return userNome; }
    public void setUserNome(String userNome) { this.userNome = userNome; }
    public String getParentesco() { return parentesco; }
    public void setParentesco(String parentesco) { this.parentesco = parentesco; }
}
