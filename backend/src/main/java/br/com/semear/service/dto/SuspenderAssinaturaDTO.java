package br.com.semear.service.dto;

import java.io.Serializable;

public class SuspenderAssinaturaDTO implements Serializable {

    private String motivo;

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }
}
