package br.com.semear.service.dto;

import java.io.Serializable;

public class MensagensComerciaisDTO implements Serializable {

    private String mensagemAbordagem;
    private String mensagemPreco;
    private String mensagemDemo;
    private String mensagemFimTeste;
    private String whatsappContato;
    private String emailContato;

    public String getMensagemAbordagem() {
        return mensagemAbordagem;
    }

    public void setMensagemAbordagem(String mensagemAbordagem) {
        this.mensagemAbordagem = mensagemAbordagem;
    }

    public String getMensagemPreco() {
        return mensagemPreco;
    }

    public void setMensagemPreco(String mensagemPreco) {
        this.mensagemPreco = mensagemPreco;
    }

    public String getMensagemDemo() {
        return mensagemDemo;
    }

    public void setMensagemDemo(String mensagemDemo) {
        this.mensagemDemo = mensagemDemo;
    }

    public String getMensagemFimTeste() {
        return mensagemFimTeste;
    }

    public void setMensagemFimTeste(String mensagemFimTeste) {
        this.mensagemFimTeste = mensagemFimTeste;
    }

    public String getWhatsappContato() {
        return whatsappContato;
    }

    public void setWhatsappContato(String whatsappContato) {
        this.whatsappContato = whatsappContato;
    }

    public String getEmailContato() {
        return emailContato;
    }

    public void setEmailContato(String emailContato) {
        this.emailContato = emailContato;
    }
}
