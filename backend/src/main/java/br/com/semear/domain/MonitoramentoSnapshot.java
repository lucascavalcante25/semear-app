package br.com.semear.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "monitoramento_snapshot")
public class MonitoramentoSnapshot implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @Column(name = "coletado_em", nullable = false)
    private Instant coletadoEm;

    @Column(name = "status_geral", length = 20)
    private String statusGeral;

    @Column(name = "status_banco", length = 20)
    private String statusBanco;

    @Column(name = "memoria_percentual")
    private Integer memoriaPercentual;

    @Column(name = "cpu_percentual")
    private Double cpuPercentual;

    @Column(name = "conexoes_ativas")
    private Integer conexoesAtivas;

    @Column(name = "conexoes_max")
    private Integer conexoesMax;

    @Column(name = "requisicoes_por_minuto")
    private Double requisicoesPorMinuto;

    @Column(name = "latencia_media_ms")
    private Double latenciaMediaMs;

    @Column(name = "total_usuarios")
    private Long totalUsuarios;

    @Column(name = "total_igrejas")
    private Long totalIgrejas;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Instant getColetadoEm() { return coletadoEm; }
    public void setColetadoEm(Instant coletadoEm) { this.coletadoEm = coletadoEm; }
    public String getStatusGeral() { return statusGeral; }
    public void setStatusGeral(String statusGeral) { this.statusGeral = statusGeral; }
    public String getStatusBanco() { return statusBanco; }
    public void setStatusBanco(String statusBanco) { this.statusBanco = statusBanco; }
    public Integer getMemoriaPercentual() { return memoriaPercentual; }
    public void setMemoriaPercentual(Integer memoriaPercentual) { this.memoriaPercentual = memoriaPercentual; }
    public Double getCpuPercentual() { return cpuPercentual; }
    public void setCpuPercentual(Double cpuPercentual) { this.cpuPercentual = cpuPercentual; }
    public Integer getConexoesAtivas() { return conexoesAtivas; }
    public void setConexoesAtivas(Integer conexoesAtivas) { this.conexoesAtivas = conexoesAtivas; }
    public Integer getConexoesMax() { return conexoesMax; }
    public void setConexoesMax(Integer conexoesMax) { this.conexoesMax = conexoesMax; }
    public Double getRequisicoesPorMinuto() { return requisicoesPorMinuto; }
    public void setRequisicoesPorMinuto(Double requisicoesPorMinuto) { this.requisicoesPorMinuto = requisicoesPorMinuto; }
    public Double getLatenciaMediaMs() { return latenciaMediaMs; }
    public void setLatenciaMediaMs(Double latenciaMediaMs) { this.latenciaMediaMs = latenciaMediaMs; }
    public Long getTotalUsuarios() { return totalUsuarios; }
    public void setTotalUsuarios(Long totalUsuarios) { this.totalUsuarios = totalUsuarios; }
    public Long getTotalIgrejas() { return totalIgrejas; }
    public void setTotalIgrejas(Long totalIgrejas) { this.totalIgrejas = totalIgrejas; }
}
