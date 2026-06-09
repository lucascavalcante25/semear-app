package br.com.semear.service.dto;

import java.io.Serializable;

public class RecuperacaoSenhaIniciarDTO implements Serializable {

    private String cpf;

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }
}
