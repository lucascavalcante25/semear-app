package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.EscopoGeracaoEscala;
import java.io.Serializable;

public class GerarCicloEscalasDTO implements Serializable {

    private EscopoGeracaoEscala escopo;
    private Boolean substituirLimpezaExistente;

    public EscopoGeracaoEscala getEscopo() {
        return escopo;
    }

    public void setEscopo(EscopoGeracaoEscala escopo) {
        this.escopo = escopo;
    }

    public Boolean getSubstituirLimpezaExistente() {
        return substituirLimpezaExistente;
    }

    public void setSubstituirLimpezaExistente(Boolean substituirLimpezaExistente) {
        this.substituirLimpezaExistente = substituirLimpezaExistente;
    }
}
