package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.TipoSolicitacaoSuporteMensagem;
import java.io.Serializable;
import java.time.Instant;

public class SolicitacaoSuporteMensagemDTO implements Serializable {

    private Long id;
    private TipoSolicitacaoSuporteMensagem tipo;
    private String texto;
    private Instant dataEnvio;
    private String usuarioNome;
    private Long usuarioId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TipoSolicitacaoSuporteMensagem getTipo() {
        return tipo;
    }

    public void setTipo(TipoSolicitacaoSuporteMensagem tipo) {
        this.tipo = tipo;
    }

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }

    public Instant getDataEnvio() {
        return dataEnvio;
    }

    public void setDataEnvio(Instant dataEnvio) {
        this.dataEnvio = dataEnvio;
    }

    public String getUsuarioNome() {
        return usuarioNome;
    }

    public void setUsuarioNome(String usuarioNome) {
        this.usuarioNome = usuarioNome;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }
}
