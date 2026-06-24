package br.com.semear.service.dto;

import java.io.Serializable;
import java.time.Instant;

public class EscalaAlertaSecretariaDTO implements Serializable {

    private String tipo;
    private String titulo;
    private String mensagem;
    private Long geracaoId;
    private Integer diasRestantes;

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getMensagem() { return mensagem; }
    public void setMensagem(String mensagem) { this.mensagem = mensagem; }
    public Long getGeracaoId() { return geracaoId; }
    public void setGeracaoId(Long geracaoId) { this.geracaoId = geracaoId; }
    public Integer getDiasRestantes() { return diasRestantes; }
    public void setDiasRestantes(Integer diasRestantes) { this.diasRestantes = diasRestantes; }
}
