package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.RegraGeneroEscala;
import java.io.Serializable;

public class CultoEscalaRegraDTO implements Serializable {

    private Long id;
    private Long departamentoId;
    private String departamentoNome;
    private RegraGeneroEscala regraGenero;
    private Boolean ativo;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getDepartamentoId() { return departamentoId; }
    public void setDepartamentoId(Long departamentoId) { this.departamentoId = departamentoId; }
    public String getDepartamentoNome() { return departamentoNome; }
    public void setDepartamentoNome(String departamentoNome) { this.departamentoNome = departamentoNome; }
    public RegraGeneroEscala getRegraGenero() { return regraGenero; }
    public void setRegraGenero(RegraGeneroEscala regraGenero) { this.regraGenero = regraGenero; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}
