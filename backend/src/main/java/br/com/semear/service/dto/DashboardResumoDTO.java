package br.com.semear.service.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class DashboardResumoDTO implements Serializable {

    private long totalMembros;
    private long totalVisitantes;
    private long visitantesMes;
    private long pedidosOracaoAbertos;
    private long preCadastrosPendentes;
    private BigDecimal saldoMes;
    private long aniversariantesHoje;
    private long avisosAtivos;
    private long documentosVencendo;
    private List<AniversarianteResumoDTO> aniversariantes = new ArrayList<>();

    public long getTotalMembros() {
        return totalMembros;
    }

    public void setTotalMembros(long totalMembros) {
        this.totalMembros = totalMembros;
    }

    public long getTotalVisitantes() {
        return totalVisitantes;
    }

    public void setTotalVisitantes(long totalVisitantes) {
        this.totalVisitantes = totalVisitantes;
    }

    public long getVisitantesMes() {
        return visitantesMes;
    }

    public void setVisitantesMes(long visitantesMes) {
        this.visitantesMes = visitantesMes;
    }

    public long getPedidosOracaoAbertos() {
        return pedidosOracaoAbertos;
    }

    public void setPedidosOracaoAbertos(long pedidosOracaoAbertos) {
        this.pedidosOracaoAbertos = pedidosOracaoAbertos;
    }

    public long getPreCadastrosPendentes() {
        return preCadastrosPendentes;
    }

    public void setPreCadastrosPendentes(long preCadastrosPendentes) {
        this.preCadastrosPendentes = preCadastrosPendentes;
    }

    public BigDecimal getSaldoMes() {
        return saldoMes;
    }

    public void setSaldoMes(BigDecimal saldoMes) {
        this.saldoMes = saldoMes;
    }

    public long getAniversariantesHoje() {
        return aniversariantesHoje;
    }

    public void setAniversariantesHoje(long aniversariantesHoje) {
        this.aniversariantesHoje = aniversariantesHoje;
    }

    public long getAvisosAtivos() {
        return avisosAtivos;
    }

    public void setAvisosAtivos(long avisosAtivos) {
        this.avisosAtivos = avisosAtivos;
    }

    public long getDocumentosVencendo() {
        return documentosVencendo;
    }

    public void setDocumentosVencendo(long documentosVencendo) {
        this.documentosVencendo = documentosVencendo;
    }

    public List<AniversarianteResumoDTO> getAniversariantes() {
        return aniversariantes;
    }

    public void setAniversariantes(List<AniversarianteResumoDTO> aniversariantes) {
        this.aniversariantes = aniversariantes;
    }

    public static class AniversarianteResumoDTO implements Serializable {

        private Long id;
        private String nome;
        private String tipo;

        public AniversarianteResumoDTO() {}

        public AniversarianteResumoDTO(Long id, String nome) {
            this(id, nome, "NASCIMENTO");
        }

        public AniversarianteResumoDTO(Long id, String nome, String tipo) {
            this.id = id;
            this.nome = nome;
            this.tipo = tipo;
        }

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

        public String getTipo() {
            return tipo;
        }

        public void setTipo(String tipo) {
            this.tipo = tipo;
        }
    }
}
