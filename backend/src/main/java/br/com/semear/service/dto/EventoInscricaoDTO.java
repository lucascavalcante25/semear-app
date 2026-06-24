package br.com.semear.service.dto;

import java.io.Serializable;
import java.time.Instant;

public class EventoInscricaoDTO implements Serializable {

    private Long id;
    private Long eventoId;
    private Long userId;
    private String userNome;
    private Boolean confirmado;
    private Instant criadoEm;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getEventoId() { return eventoId; }
    public void setEventoId(Long eventoId) { this.eventoId = eventoId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserNome() { return userNome; }
    public void setUserNome(String userNome) { this.userNome = userNome; }
    public Boolean getConfirmado() { return confirmado; }
    public void setConfirmado(Boolean confirmado) { this.confirmado = confirmado; }
    public Instant getCriadoEm() { return criadoEm; }
    public void setCriadoEm(Instant criadoEm) { this.criadoEm = criadoEm; }
}
