package br.com.semear.service.dto;

import java.io.Serializable;

public class EnviarMensagemSuporteDTO implements Serializable {

    private String texto;

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }
}
