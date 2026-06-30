package br.com.semear.service.dto;

import java.io.Serializable;

public class RecuperacaoSenhaOpcoesDTO implements Serializable {

    private String mensagem;
    private boolean podeRecuperar;
    private boolean emailDisponivel;
    private boolean smsDisponivel;
    private boolean escolhaNecessaria;
    private boolean pushDisponivel;
    private int dispositivosPushAtivos;
    private String emailMascarado;
    private String telefoneMascarado;

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }

    public boolean isPodeRecuperar() {
        return podeRecuperar;
    }

    public void setPodeRecuperar(boolean podeRecuperar) {
        this.podeRecuperar = podeRecuperar;
    }

    public boolean isEmailDisponivel() {
        return emailDisponivel;
    }

    public void setEmailDisponivel(boolean emailDisponivel) {
        this.emailDisponivel = emailDisponivel;
    }

    public boolean isSmsDisponivel() {
        return smsDisponivel;
    }

    public void setSmsDisponivel(boolean smsDisponivel) {
        this.smsDisponivel = smsDisponivel;
    }

    public boolean isEscolhaNecessaria() {
        return escolhaNecessaria;
    }

    public void setEscolhaNecessaria(boolean escolhaNecessaria) {
        this.escolhaNecessaria = escolhaNecessaria;
    }

    public boolean isPushDisponivel() {
        return pushDisponivel;
    }

    public void setPushDisponivel(boolean pushDisponivel) {
        this.pushDisponivel = pushDisponivel;
    }

    public int getDispositivosPushAtivos() {
        return dispositivosPushAtivos;
    }

    public void setDispositivosPushAtivos(int dispositivosPushAtivos) {
        this.dispositivosPushAtivos = dispositivosPushAtivos;
    }

    public String getEmailMascarado() {
        return emailMascarado;
    }

    public void setEmailMascarado(String emailMascarado) {
        this.emailMascarado = emailMascarado;
    }

    public String getTelefoneMascarado() {
        return telefoneMascarado;
    }

    public void setTelefoneMascarado(String telefoneMascarado) {
        this.telefoneMascarado = telefoneMascarado;
    }
}
