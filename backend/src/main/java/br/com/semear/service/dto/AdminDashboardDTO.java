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
    private BigDecimal receitaMensalPrevista;

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
    public BigDecimal getReceitaMensalPrevista() { return receitaMensalPrevista; }
    public void setReceitaMensalPrevista(BigDecimal v) { this.receitaMensalPrevista = v; }
}
