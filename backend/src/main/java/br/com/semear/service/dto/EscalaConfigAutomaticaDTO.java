package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.DiaSemanaCulto;
import br.com.semear.domain.enumeration.ModoLimpezaEscala;
import java.io.Serializable;

public class EscalaConfigAutomaticaDTO implements Serializable {

    private Long id;
    private Integer mesesCiclo;
    private Integer diasAntecedencia;
    private Boolean ativo;
    private Boolean podeGerarProximoCiclo;
    private java.time.LocalDate proximaDataGeracao;
    private String motivoBloqueioGeracao;
    private Boolean gerarPortaria;
    private Boolean gerarRecepcao;
    private Boolean gerarLimpeza;
    private Boolean agruparPortariaRecepcao;
    private Boolean limpezaMensal;
    private ModoLimpezaEscala modoLimpeza;
    private DiaSemanaCulto diaSemanaLimpeza;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getMesesCiclo() { return mesesCiclo; }
    public void setMesesCiclo(Integer mesesCiclo) { this.mesesCiclo = mesesCiclo; }
    public Integer getDiasAntecedencia() { return diasAntecedencia; }
    public void setDiasAntecedencia(Integer diasAntecedencia) { this.diasAntecedencia = diasAntecedencia; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
    public Boolean getPodeGerarProximoCiclo() { return podeGerarProximoCiclo; }
    public void setPodeGerarProximoCiclo(Boolean podeGerarProximoCiclo) { this.podeGerarProximoCiclo = podeGerarProximoCiclo; }
    public java.time.LocalDate getProximaDataGeracao() { return proximaDataGeracao; }
    public void setProximaDataGeracao(java.time.LocalDate proximaDataGeracao) { this.proximaDataGeracao = proximaDataGeracao; }
    public String getMotivoBloqueioGeracao() { return motivoBloqueioGeracao; }
    public void setMotivoBloqueioGeracao(String motivoBloqueioGeracao) { this.motivoBloqueioGeracao = motivoBloqueioGeracao; }
    public Boolean getGerarPortaria() { return gerarPortaria; }
    public void setGerarPortaria(Boolean gerarPortaria) { this.gerarPortaria = gerarPortaria; }
    public Boolean getGerarRecepcao() { return gerarRecepcao; }
    public void setGerarRecepcao(Boolean gerarRecepcao) { this.gerarRecepcao = gerarRecepcao; }
    public Boolean getGerarLimpeza() { return gerarLimpeza; }
    public void setGerarLimpeza(Boolean gerarLimpeza) { this.gerarLimpeza = gerarLimpeza; }
    public Boolean getAgruparPortariaRecepcao() { return agruparPortariaRecepcao; }
    public void setAgruparPortariaRecepcao(Boolean agruparPortariaRecepcao) { this.agruparPortariaRecepcao = agruparPortariaRecepcao; }
    public Boolean getLimpezaMensal() { return limpezaMensal; }
    public void setLimpezaMensal(Boolean limpezaMensal) { this.limpezaMensal = limpezaMensal; }
    public ModoLimpezaEscala getModoLimpeza() { return modoLimpeza; }
    public void setModoLimpeza(ModoLimpezaEscala modoLimpeza) { this.modoLimpeza = modoLimpeza; }
    public DiaSemanaCulto getDiaSemanaLimpeza() { return diaSemanaLimpeza; }
    public void setDiaSemanaLimpeza(DiaSemanaCulto diaSemanaLimpeza) { this.diaSemanaLimpeza = diaSemanaLimpeza; }
}
