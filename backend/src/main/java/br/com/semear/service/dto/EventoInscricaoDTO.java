package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.StatusInscricaoEvento;
import java.io.Serializable;
import java.time.Instant;

public class EventoInscricaoDTO implements Serializable {

    private Long id;
    private Long eventoId;
    private Long userId;
    private String userNome;
    private String userEmail;
    private String userTelefone;
    private Boolean confirmado;
    private StatusInscricaoEvento status;
    private Instant criadoEm;
    private Instant canceladoEm;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getEventoId() { return eventoId; }
    public void setEventoId(Long eventoId) { this.eventoId = eventoId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserNome() { return userNome; }
    public void setUserNome(String userNome) { this.userNome = userNome; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getUserTelefone() { return userTelefone; }
    public void setUserTelefone(String userTelefone) { this.userTelefone = userTelefone; }
    public Boolean getConfirmado() { return confirmado; }
    public void setConfirmado(Boolean confirmado) { this.confirmado = confirmado; }
    public StatusInscricaoEvento getStatus() { return status; }
    public void setStatus(StatusInscricaoEvento status) { this.status = status; }
    public Instant getCriadoEm() { return criadoEm; }
    public void setCriadoEm(Instant criadoEm) { this.criadoEm = criadoEm; }
    public Instant getCanceladoEm() { return canceladoEm; }
    public void setCanceladoEm(Instant canceladoEm) { this.canceladoEm = canceladoEm; }
}
