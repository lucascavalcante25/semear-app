package br.com.semear.service.dto;

import java.io.Serializable;
import java.time.LocalTime;

public class UsuarioPreferenciaNotificacaoDTO implements Serializable {

    private Boolean pushAtivo;
    private Boolean eventosAtivo;
    private Boolean escalasAtivo;
    private Boolean devocionalAtivo;
    private Boolean avisosGeraisAtivo;
    private Boolean departamentosAtivo;
    private LocalTime horarioSilenciosoInicio;
    private LocalTime horarioSilenciosoFim;
    private boolean dispositivoRegistrado;

    public Boolean getPushAtivo() { return pushAtivo; }
    public void setPushAtivo(Boolean pushAtivo) { this.pushAtivo = pushAtivo; }
    public Boolean getEventosAtivo() { return eventosAtivo; }
    public void setEventosAtivo(Boolean eventosAtivo) { this.eventosAtivo = eventosAtivo; }
    public Boolean getEscalasAtivo() { return escalasAtivo; }
    public void setEscalasAtivo(Boolean escalasAtivo) { this.escalasAtivo = escalasAtivo; }
    public Boolean getDevocionalAtivo() { return devocionalAtivo; }
    public void setDevocionalAtivo(Boolean devocionalAtivo) { this.devocionalAtivo = devocionalAtivo; }
    public Boolean getAvisosGeraisAtivo() { return avisosGeraisAtivo; }
    public void setAvisosGeraisAtivo(Boolean avisosGeraisAtivo) { this.avisosGeraisAtivo = avisosGeraisAtivo; }
    public Boolean getDepartamentosAtivo() { return departamentosAtivo; }
    public void setDepartamentosAtivo(Boolean departamentosAtivo) { this.departamentosAtivo = departamentosAtivo; }
    public LocalTime getHorarioSilenciosoInicio() { return horarioSilenciosoInicio; }
    public void setHorarioSilenciosoInicio(LocalTime horarioSilenciosoInicio) { this.horarioSilenciosoInicio = horarioSilenciosoInicio; }
    public LocalTime getHorarioSilenciosoFim() { return horarioSilenciosoFim; }
    public void setHorarioSilenciosoFim(LocalTime horarioSilenciosoFim) { this.horarioSilenciosoFim = horarioSilenciosoFim; }
    public boolean isDispositivoRegistrado() { return dispositivoRegistrado; }
    public void setDispositivoRegistrado(boolean dispositivoRegistrado) { this.dispositivoRegistrado = dispositivoRegistrado; }
}
