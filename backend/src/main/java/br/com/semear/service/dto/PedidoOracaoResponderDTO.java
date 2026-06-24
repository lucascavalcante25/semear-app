package br.com.semear.service.dto;

import java.io.Serializable;

public class PedidoOracaoResponderDTO implements Serializable {

    private String respostaTexto;

    public String getRespostaTexto() {
        return respostaTexto;
    }

    public void setRespostaTexto(String respostaTexto) {
        this.respostaTexto = respostaTexto;
    }
}
