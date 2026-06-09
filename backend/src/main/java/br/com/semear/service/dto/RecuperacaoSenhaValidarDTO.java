package br.com.semear.service.dto;

import java.io.Serializable;

public class RecuperacaoSenhaValidarDTO implements Serializable {

    private String cpf;
    private String codigo;

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }
}
