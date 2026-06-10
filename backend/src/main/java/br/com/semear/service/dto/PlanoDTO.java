package br.com.semear.service.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

public class PlanoDTO implements Serializable {

    private Long id;
    private String nome;
    private String descricao;
    private BigDecimal valorMensal;
    private BigDecimal valorAnual;
    private BigDecimal valorImplantacao;
    private Integer diasTrial;
    private Integer limiteMembros;
    private Boolean destaque;
    private String textoBotao;
    private Integer ordemExibicao;
    private Boolean ativo;
    private Instant dataCadastro;
    private Instant dataAtualizacao;
    private BigDecimal promocaoImplantacaoAnual;
    private Integer descontoAnualPercentual;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public Instant getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(Instant dataCadastro) {
        this.dataCadastro = dataCadastro;
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

    public Integer getDiasTrial() {
        return diasTrial;
    }

    public void setDiasTrial(Integer diasTrial) {
        this.diasTrial = diasTrial;
    }

    public Integer getLimiteMembros() {
        return limiteMembros;
    }

    public void setLimiteMembros(Integer limiteMembros) {
        this.limiteMembros = limiteMembros;
    }

    public Boolean getDestaque() {
        return destaque;
    }

    public void setDestaque(Boolean destaque) {
        this.destaque = destaque;
    }

    public String getTextoBotao() {
        return textoBotao;
    }

    public void setTextoBotao(String textoBotao) {
        this.textoBotao = textoBotao;
    }

    public Integer getOrdemExibicao() {
        return ordemExibicao;
    }

    public void setOrdemExibicao(Integer ordemExibicao) {
        this.ordemExibicao = ordemExibicao;
    }

    public Instant getDataAtualizacao() {
        return dataAtualizacao;
    }

    public void setDataAtualizacao(Instant dataAtualizacao) {
        this.dataAtualizacao = dataAtualizacao;
    }

    public BigDecimal getPromocaoImplantacaoAnual() {
        return promocaoImplantacaoAnual;
    }

    public void setPromocaoImplantacaoAnual(BigDecimal promocaoImplantacaoAnual) {
        this.promocaoImplantacaoAnual = promocaoImplantacaoAnual;
    }

    public Integer getDescontoAnualPercentual() {
        return descontoAnualPercentual;
    }

    public void setDescontoAnualPercentual(Integer descontoAnualPercentual) {
        this.descontoAnualPercentual = descontoAnualPercentual;
    }
}
