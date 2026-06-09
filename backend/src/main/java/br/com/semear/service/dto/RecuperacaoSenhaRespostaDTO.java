package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.CanalRecuperacaoSenha;
import java.io.Serializable;

public class RecuperacaoSenhaRespostaDTO implements Serializable {

    private String mensagem;
    private CanalRecuperacaoSenha canal;
    private String destinoMascarado;
    private boolean codigoEnviado;

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }

    public CanalRecuperacaoSenha getCanal() {
        return canal;
    }

    public void setCanal(CanalRecuperacaoSenha canal) {
        this.canal = canal;
    }

    public String getDestinoMascarado() {
        return destinoMascarado;
    }

    public void setDestinoMascarado(String destinoMascarado) {
        this.destinoMascarado = destinoMascarado;
    }

    public boolean isCodigoEnviado() {
        return codigoEnviado;
    }

    public void setCodigoEnviado(boolean codigoEnviado) {
        this.codigoEnviado = codigoEnviado;
    }
}
