package br.com.semear.service.dto;

import java.io.Serializable;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class AdminMonitoramentoDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Instant coletadoEm;
    private long uptimeSegundos;
    private String statusGeral;
    private String statusBanco;
    private String statusDisco;

    private double memoriaUsadaMb;
    private double memoriaMaxMb;
    private int memoriaPercentual;
    private double cpuPercentual;
    private int threadsAtivas;

    private int conexoesAtivas;
    private int conexoesIdle;
    private int conexoesMax;
    private int conexoesPendentes;

    private double requisicoesPorMinuto;
    private double latenciaMediaMs;
    private long totalRequisicoes;

    private long totalIgrejas;
    private long igrejasAtivas;
    private long totalUsuarios;
    private long usuariosAtivos;
    private long totalComunicados;
    private long totalEventos;
    private long dispositivosPushAtivos;
    private long notificacoesEnviadas24h;
    private boolean pushHabilitado;

    private List<IgrejaUsoDTO> topIgrejasPorUsuarios = new ArrayList<>();
    private List<TabelaVolumeDTO> volumesTabela = new ArrayList<>();
    private List<String> alertas = new ArrayList<>();
    private List<ServicoStatusDTO> servicos = new ArrayList<>();

    public static class IgrejaUsoDTO implements Serializable {

        private static final long serialVersionUID = 1L;
        private Long igrejaId;
        private String nome;
        private long usuariosAtivos;

        public Long getIgrejaId() { return igrejaId; }
        public void setIgrejaId(Long igrejaId) { this.igrejaId = igrejaId; }
        public String getNome() { return nome; }
        public void setNome(String nome) { this.nome = nome; }
        public long getUsuariosAtivos() { return usuariosAtivos; }
        public void setUsuariosAtivos(long usuariosAtivos) { this.usuariosAtivos = usuariosAtivos; }
    }

    public static class TabelaVolumeDTO implements Serializable {

        private static final long serialVersionUID = 1L;
        private String tabela;
        private long registrosEstimados;

        public String getTabela() { return tabela; }
        public void setTabela(String tabela) { this.tabela = tabela; }
        public long getRegistrosEstimados() { return registrosEstimados; }
        public void setRegistrosEstimados(long registrosEstimados) { this.registrosEstimados = registrosEstimados; }
    }

    public static class ServicoStatusDTO implements Serializable {

        private static final long serialVersionUID = 1L;
        private String nome;
        private String status;
        private String detalhe;

        public ServicoStatusDTO() {}

        public ServicoStatusDTO(String nome, String status, String detalhe) {
            this.nome = nome;
            this.status = status;
            this.detalhe = detalhe;
        }

        public String getNome() { return nome; }
        public void setNome(String nome) { this.nome = nome; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getDetalhe() { return detalhe; }
        public void setDetalhe(String detalhe) { this.detalhe = detalhe; }
    }

    public Instant getColetadoEm() { return coletadoEm; }
    public void setColetadoEm(Instant coletadoEm) { this.coletadoEm = coletadoEm; }
    public long getUptimeSegundos() { return uptimeSegundos; }
    public void setUptimeSegundos(long uptimeSegundos) { this.uptimeSegundos = uptimeSegundos; }
    public String getStatusGeral() { return statusGeral; }
    public void setStatusGeral(String statusGeral) { this.statusGeral = statusGeral; }
    public String getStatusBanco() { return statusBanco; }
    public void setStatusBanco(String statusBanco) { this.statusBanco = statusBanco; }
    public String getStatusDisco() { return statusDisco; }
    public void setStatusDisco(String statusDisco) { this.statusDisco = statusDisco; }
    public double getMemoriaUsadaMb() { return memoriaUsadaMb; }
    public void setMemoriaUsadaMb(double memoriaUsadaMb) { this.memoriaUsadaMb = memoriaUsadaMb; }
    public double getMemoriaMaxMb() { return memoriaMaxMb; }
    public void setMemoriaMaxMb(double memoriaMaxMb) { this.memoriaMaxMb = memoriaMaxMb; }
    public int getMemoriaPercentual() { return memoriaPercentual; }
    public void setMemoriaPercentual(int memoriaPercentual) { this.memoriaPercentual = memoriaPercentual; }
    public double getCpuPercentual() { return cpuPercentual; }
    public void setCpuPercentual(double cpuPercentual) { this.cpuPercentual = cpuPercentual; }
    public int getThreadsAtivas() { return threadsAtivas; }
    public void setThreadsAtivas(int threadsAtivas) { this.threadsAtivas = threadsAtivas; }
    public int getConexoesAtivas() { return conexoesAtivas; }
    public void setConexoesAtivas(int conexoesAtivas) { this.conexoesAtivas = conexoesAtivas; }
    public int getConexoesIdle() { return conexoesIdle; }
    public void setConexoesIdle(int conexoesIdle) { this.conexoesIdle = conexoesIdle; }
    public int getConexoesMax() { return conexoesMax; }
    public void setConexoesMax(int conexoesMax) { this.conexoesMax = conexoesMax; }
    public int getConexoesPendentes() { return conexoesPendentes; }
    public void setConexoesPendentes(int conexoesPendentes) { this.conexoesPendentes = conexoesPendentes; }
    public double getRequisicoesPorMinuto() { return requisicoesPorMinuto; }
    public void setRequisicoesPorMinuto(double requisicoesPorMinuto) { this.requisicoesPorMinuto = requisicoesPorMinuto; }
    public double getLatenciaMediaMs() { return latenciaMediaMs; }
    public void setLatenciaMediaMs(double latenciaMediaMs) { this.latenciaMediaMs = latenciaMediaMs; }
    public long getTotalRequisicoes() { return totalRequisicoes; }
    public void setTotalRequisicoes(long totalRequisicoes) { this.totalRequisicoes = totalRequisicoes; }
    public long getTotalIgrejas() { return totalIgrejas; }
    public void setTotalIgrejas(long totalIgrejas) { this.totalIgrejas = totalIgrejas; }
    public long getIgrejasAtivas() { return igrejasAtivas; }
    public void setIgrejasAtivas(long igrejasAtivas) { this.igrejasAtivas = igrejasAtivas; }
    public long getTotalUsuarios() { return totalUsuarios; }
    public void setTotalUsuarios(long totalUsuarios) { this.totalUsuarios = totalUsuarios; }
    public long getUsuariosAtivos() { return usuariosAtivos; }
    public void setUsuariosAtivos(long usuariosAtivos) { this.usuariosAtivos = usuariosAtivos; }
    public long getTotalComunicados() { return totalComunicados; }
    public void setTotalComunicados(long totalComunicados) { this.totalComunicados = totalComunicados; }
    public long getTotalEventos() { return totalEventos; }
    public void setTotalEventos(long totalEventos) { this.totalEventos = totalEventos; }
    public long getDispositivosPushAtivos() { return dispositivosPushAtivos; }
    public void setDispositivosPushAtivos(long dispositivosPushAtivos) { this.dispositivosPushAtivos = dispositivosPushAtivos; }
    public long getNotificacoesEnviadas24h() { return notificacoesEnviadas24h; }
    public void setNotificacoesEnviadas24h(long notificacoesEnviadas24h) { this.notificacoesEnviadas24h = notificacoesEnviadas24h; }
    public boolean isPushHabilitado() { return pushHabilitado; }
    public void setPushHabilitado(boolean pushHabilitado) { this.pushHabilitado = pushHabilitado; }
    public List<IgrejaUsoDTO> getTopIgrejasPorUsuarios() { return topIgrejasPorUsuarios; }
    public void setTopIgrejasPorUsuarios(List<IgrejaUsoDTO> topIgrejasPorUsuarios) {
        this.topIgrejasPorUsuarios = topIgrejasPorUsuarios != null ? topIgrejasPorUsuarios : new ArrayList<>();
    }
    public List<TabelaVolumeDTO> getVolumesTabela() { return volumesTabela; }
    public void setVolumesTabela(List<TabelaVolumeDTO> volumesTabela) {
        this.volumesTabela = volumesTabela != null ? volumesTabela : new ArrayList<>();
    }
    public List<String> getAlertas() { return alertas; }
    public void setAlertas(List<String> alertas) {
        this.alertas = alertas != null ? alertas : new ArrayList<>();
    }
    public List<ServicoStatusDTO> getServicos() { return servicos; }
    public void setServicos(List<ServicoStatusDTO> servicos) {
        this.servicos = servicos != null ? servicos : new ArrayList<>();
    }
}
