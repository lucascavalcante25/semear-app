package br.com.semear.service.dto;

import java.io.Serializable;
import java.time.Instant;

public class NotificacaoPersistidaDTO implements Serializable {

    private Long id;
    private String titulo;
    private String mensagem;
    private String tipo;
    private String link;
    private Boolean lida;
    private Instant criadoEm;
    private Boolean enviadaPush;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getMensagem() { return mensagem; }
    public void setMensagem(String mensagem) { this.mensagem = mensagem; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }
    public Boolean getLida() { return lida; }
    public void setLida(Boolean lida) { this.lida = lida; }
    public Instant getCriadoEm() { return criadoEm; }
    public void setCriadoEm(Instant criadoEm) { this.criadoEm = criadoEm; }
    public Boolean getEnviadaPush() { return enviadaPush; }
    public void setEnviadaPush(Boolean enviadaPush) { this.enviadaPush = enviadaPush; }
}
