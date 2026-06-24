package br.com.semear.service.dto;

import java.io.Serializable;
import java.time.Instant;

public class InformativoLeituraDTO implements Serializable {

    private Long id;
    private Long usuarioId;
    private String usuarioNome;
    private Instant confirmadoEm;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getUsuarioNome() {
        return usuarioNome;
    }

    public void setUsuarioNome(String usuarioNome) {
        this.usuarioNome = usuarioNome;
    }

    public Instant getConfirmadoEm() {
        return confirmadoEm;
    }

    public void setConfirmadoEm(Instant confirmadoEm) {
        this.confirmadoEm = confirmadoEm;
    }
}
