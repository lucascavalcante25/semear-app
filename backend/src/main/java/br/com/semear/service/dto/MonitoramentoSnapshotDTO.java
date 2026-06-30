package br.com.semear.service.dto;

import java.io.Serializable;
import java.time.Instant;

public class MonitoramentoSnapshotDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Instant coletadoEm;
    private String statusGeral;
    private String statusBanco;
    private int memoriaPercentual;
    private double cpuPercentual;
    private int conexoesAtivas;
    private int conexoesMax;
    private double requisicoesPorMinuto;
    private double latenciaMediaMs;
    private long totalUsuarios;
    private long totalIgrejas;

    public Instant getColetadoEm() { return coletadoEm; }
    public void setColetadoEm(Instant coletadoEm) { this.coletadoEm = coletadoEm; }
    public String getStatusGeral() { return statusGeral; }
    public void setStatusGeral(String statusGeral) { this.statusGeral = statusGeral; }
    public String getStatusBanco() { return statusBanco; }
    public void setStatusBanco(String statusBanco) { this.statusBanco = statusBanco; }
    public int getMemoriaPercentual() { return memoriaPercentual; }
    public void setMemoriaPercentual(int memoriaPercentual) { this.memoriaPercentual = memoriaPercentual; }
    public double getCpuPercentual() { return cpuPercentual; }
    public void setCpuPercentual(double cpuPercentual) { this.cpuPercentual = cpuPercentual; }
    public int getConexoesAtivas() { return conexoesAtivas; }
    public void setConexoesAtivas(int conexoesAtivas) { this.conexoesAtivas = conexoesAtivas; }
    public int getConexoesMax() { return conexoesMax; }
    public void setConexoesMax(int conexoesMax) { this.conexoesMax = conexoesMax; }
    public double getRequisicoesPorMinuto() { return requisicoesPorMinuto; }
    public void setRequisicoesPorMinuto(double requisicoesPorMinuto) { this.requisicoesPorMinuto = requisicoesPorMinuto; }
    public double getLatenciaMediaMs() { return latenciaMediaMs; }
    public void setLatenciaMediaMs(double latenciaMediaMs) { this.latenciaMediaMs = latenciaMediaMs; }
    public long getTotalUsuarios() { return totalUsuarios; }
    public void setTotalUsuarios(long totalUsuarios) { this.totalUsuarios = totalUsuarios; }
    public long getTotalIgrejas() { return totalIgrejas; }
    public void setTotalIgrejas(long totalIgrejas) { this.totalIgrejas = totalIgrejas; }
}
