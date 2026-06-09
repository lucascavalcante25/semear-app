package br.com.semear.service.dto;

import java.io.Serializable;

public class RecuperacaoSenhaConcluirDTO implements Serializable {

    private String cpf;
    private String codigo;
    private String novaSenha;

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

    public String getNovaSenha() {
        return novaSenha;
    }

    public void setNovaSenha(String novaSenha) {
        this.novaSenha = novaSenha;
    }
}
