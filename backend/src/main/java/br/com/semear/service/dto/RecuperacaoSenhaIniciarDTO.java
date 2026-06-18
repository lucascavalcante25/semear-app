package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.CanalRecuperacaoSenha;
import java.io.Serializable;

public class RecuperacaoSenhaIniciarDTO implements Serializable {

    private String cpf;
    private CanalRecuperacaoSenha canal;

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public CanalRecuperacaoSenha getCanal() {
        return canal;
    }

    public void setCanal(CanalRecuperacaoSenha canal) {
        this.canal = canal;
    }
}
