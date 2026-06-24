package br.com.semear.service.dto;

import java.io.Serializable;

public class CelulaMembroDTO implements Serializable {

    private Long id;
    private Long celulaId;
    private Long userId;
    private String userNome;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCelulaId() { return celulaId; }
    public void setCelulaId(Long celulaId) { this.celulaId = celulaId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserNome() { return userNome; }
    public void setUserNome(String userNome) { this.userNome = userNome; }
}
