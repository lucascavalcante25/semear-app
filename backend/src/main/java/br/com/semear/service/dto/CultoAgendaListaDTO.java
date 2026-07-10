package br.com.semear.service.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class CultoAgendaListaDTO implements Serializable {
    private List<CultoAgendaItemDTO> proximos = new ArrayList<>();
    private List<CultoAgendaItemDTO> passados = new ArrayList<>();

    public List<CultoAgendaItemDTO> getProximos() { return proximos; }
    public void setProximos(List<CultoAgendaItemDTO> proximos) { this.proximos = proximos; }
    public List<CultoAgendaItemDTO> getPassados() { return passados; }
    public void setPassados(List<CultoAgendaItemDTO> passados) { this.passados = passados; }
}
