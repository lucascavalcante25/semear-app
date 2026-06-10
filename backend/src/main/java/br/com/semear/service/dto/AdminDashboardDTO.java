package br.com.semear.service.dto;

import java.io.Serializable;
import java.math.BigDecimal;

public class AdminDashboardDTO implements Serializable {

    private long totalIgrejas;
    private long igrejasAtivas;
    private long igrejasEmTeste;
    private long igrejasInativas;
    private long totalUsuarios;
    private long solicitacoesPendentes;
    private long suporteAbertas;
    private long suporteEmAnalise;
    private BigDecimal receitaMensalPrevista;
    private BigDecimal receitaAnualPrevista;
    private long testesVencendoEm3Dias;
    private long testesVencidos;
    private long pagamentosPendentes;
    private long pagamentosAtrasados;
    private long implantacoesPendentes;
    private long suporteEmAberto;

    public long getTotalIgrejas() { return totalIgrejas; }
    public void setTotalIgrejas(long v) { this.totalIgrejas = v; }
    public long getIgrejasAtivas() { return igrejasAtivas; }
    public void setIgrejasAtivas(long v) { this.igrejasAtivas = v; }
    public long getIgrejasEmTeste() { return igrejasEmTeste; }
    public void setIgrejasEmTeste(long v) { this.igrejasEmTeste = v; }
    public long getIgrejasInativas() { return igrejasInativas; }
    public void setIgrejasInativas(long v) { this.igrejasInativas = v; }
    public long getTotalUsuarios() { return totalUsuarios; }
    public void setTotalUsuarios(long v) { this.totalUsuarios = v; }
    public long getSolicitacoesPendentes() { return solicitacoesPendentes; }
    public void setSolicitacoesPendentes(long v) { this.solicitacoesPendentes = v; }
    public long getSuporteAbertas() { return suporteAbertas; }
    public void setSuporteAbertas(long v) { this.suporteAbertas = v; }
    public long getSuporteEmAnalise() { return suporteEmAnalise; }
    public void setSuporteEmAnalise(long v) { this.suporteEmAnalise = v; }
    public BigDecimal getReceitaMensalPrevista() { return receitaMensalPrevista; }
    public void setReceitaMensalPrevista(BigDecimal v) { this.receitaMensalPrevista = v; }
    public BigDecimal getReceitaAnualPrevista() { return receitaAnualPrevista; }
    public void setReceitaAnualPrevista(BigDecimal v) { this.receitaAnualPrevista = v; }
    public long getTestesVencendoEm3Dias() { return testesVencendoEm3Dias; }
    public void setTestesVencendoEm3Dias(long v) { this.testesVencendoEm3Dias = v; }
    public long getTestesVencidos() { return testesVencidos; }
    public void setTestesVencidos(long v) { this.testesVencidos = v; }
    public long getPagamentosPendentes() { return pagamentosPendentes; }
    public void setPagamentosPendentes(long v) { this.pagamentosPendentes = v; }
    public long getPagamentosAtrasados() { return pagamentosAtrasados; }
    public void setPagamentosAtrasados(long v) { this.pagamentosAtrasados = v; }
    public long getImplantacoesPendentes() { return implantacoesPendentes; }
    public void setImplantacoesPendentes(long v) { this.implantacoesPendentes = v; }
    public long getSuporteEmAberto() { return suporteEmAberto; }
    public void setSuporteEmAberto(long v) { this.suporteEmAberto = v; }
}
