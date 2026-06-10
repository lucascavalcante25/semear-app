package br.com.semear.service.dto;

import java.io.Serializable;
import java.math.BigDecimal;

public class PlanoPublicoDTO implements Serializable {

    private String nome;
    private String descricao;
    private BigDecimal valorMensal;
    private BigDecimal valorAnual;
    private BigDecimal valorImplantacao;
    private BigDecimal promocaoImplantacaoAnual;
    private Integer diasTrial;
    private Integer descontoAnualPercentual;
    private String textoBotao;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public BigDecimal getValorMensal() {
        return valorMensal;
    }

    public void setValorMensal(BigDecimal valorMensal) {
        this.valorMensal = valorMensal;
    }

    public BigDecimal getValorAnual() {
        return valorAnual;
    }

    public void setValorAnual(BigDecimal valorAnual) {
        this.valorAnual = valorAnual;
    }

    public BigDecimal getValorImplantacao() {
        return valorImplantacao;
    }

    public void setValorImplantacao(BigDecimal valorImplantacao) {
        this.valorImplantacao = valorImplantacao;
    }

    public BigDecimal getPromocaoImplantacaoAnual() {
        return promocaoImplantacaoAnual;
    }

    public void setPromocaoImplantacaoAnual(BigDecimal promocaoImplantacaoAnual) {
        this.promocaoImplantacaoAnual = promocaoImplantacaoAnual;
    }

    public Integer getDiasTrial() {
        return diasTrial;
    }

    public void setDiasTrial(Integer diasTrial) {
        this.diasTrial = diasTrial;
    }

    public Integer getDescontoAnualPercentual() {
        return descontoAnualPercentual;
    }

    public void setDescontoAnualPercentual(Integer descontoAnualPercentual) {
        this.descontoAnualPercentual = descontoAnualPercentual;
    }

    public String getTextoBotao() {
        return textoBotao;
    }

    public void setTextoBotao(String textoBotao) {
        this.textoBotao = textoBotao;
    }
}
