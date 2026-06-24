package br.com.semear.service.dto;

import java.io.Serializable;
import java.time.Instant;

public class EscalaLoginAvisoDTO implements Serializable {

    private Long escalaItemId;
    private Long escalaId;
    private String tituloEscala;
    private String departamentoNome;
    private String funcao;
    private Instant dataEvento;
    private String cultoNome;
    private String orientacoesServico;

    public Long getEscalaItemId() { return escalaItemId; }
    public void setEscalaItemId(Long escalaItemId) { this.escalaItemId = escalaItemId; }
    public Long getEscalaId() { return escalaId; }
    public void setEscalaId(Long escalaId) { this.escalaId = escalaId; }
    public String getTituloEscala() { return tituloEscala; }
    public void setTituloEscala(String tituloEscala) { this.tituloEscala = tituloEscala; }
    public String getDepartamentoNome() { return departamentoNome; }
    public void setDepartamentoNome(String departamentoNome) { this.departamentoNome = departamentoNome; }
    public String getFuncao() { return funcao; }
    public void setFuncao(String funcao) { this.funcao = funcao; }
    public Instant getDataEvento() { return dataEvento; }
    public void setDataEvento(Instant dataEvento) { this.dataEvento = dataEvento; }
    public String getCultoNome() { return cultoNome; }
    public void setCultoNome(String cultoNome) { this.cultoNome = cultoNome; }
    public String getOrientacoesServico() { return orientacoesServico; }
    public void setOrientacoesServico(String orientacoesServico) { this.orientacoesServico = orientacoesServico; }
}
