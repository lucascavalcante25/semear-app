package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.EscopoGeracaoEscala;
import java.io.Serializable;

public class GerarCicloEscalasDTO implements Serializable {

    private EscopoGeracaoEscala escopo;

    public EscopoGeracaoEscala getEscopo() {
        return escopo;
    }

    public void setEscopo(EscopoGeracaoEscala escopo) {
        this.escopo = escopo;
    }
}
