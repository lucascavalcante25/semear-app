package br.com.semear.service.dto;

import java.io.Serializable;

/** Payload interno para envio de notificação (interna + push). */
public class NotificacaoPayloadDTO implements Serializable {

    private String titulo;
    private String mensagem;
    private String tipo;
    private String rotaDestino;
    private String entidadeTipo;
    private Long entidadeId;
    private Long igrejaId;
    private boolean respeitarHorarioSilencioso = true;
    private boolean registrarDeduplicacao = false;
    private String chaveDeduplicacao;
    /** Descrição legível do público-alvo — usada nos logs (ex.: "TODOS os membros ativos"). */
    private String contextoDestinatarios;

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getMensagem() { return mensagem; }
    public void setMensagem(String mensagem) { this.mensagem = mensagem; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getRotaDestino() { return rotaDestino; }
    public void setRotaDestino(String rotaDestino) { this.rotaDestino = rotaDestino; }
    public String getEntidadeTipo() { return entidadeTipo; }
    public void setEntidadeTipo(String entidadeTipo) { this.entidadeTipo = entidadeTipo; }
    public Long getEntidadeId() { return entidadeId; }
    public void setEntidadeId(Long entidadeId) { this.entidadeId = entidadeId; }
    public Long getIgrejaId() { return igrejaId; }
    public void setIgrejaId(Long igrejaId) { this.igrejaId = igrejaId; }
    public boolean isRespeitarHorarioSilencioso() { return respeitarHorarioSilencioso; }
    public void setRespeitarHorarioSilencioso(boolean respeitarHorarioSilencioso) { this.respeitarHorarioSilencioso = respeitarHorarioSilencioso; }
    public boolean isRegistrarDeduplicacao() { return registrarDeduplicacao; }
    public void setRegistrarDeduplicacao(boolean registrarDeduplicacao) { this.registrarDeduplicacao = registrarDeduplicacao; }
    public String getChaveDeduplicacao() { return chaveDeduplicacao; }
    public void setChaveDeduplicacao(String chaveDeduplicacao) { this.chaveDeduplicacao = chaveDeduplicacao; }
    public String getContextoDestinatarios() { return contextoDestinatarios; }
    public void setContextoDestinatarios(String contextoDestinatarios) { this.contextoDestinatarios = contextoDestinatarios; }
}
