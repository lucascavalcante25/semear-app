package br.com.semear.service.dto;

import java.io.Serializable;
import java.math.BigDecimal;

public class FinanceiroPlataformaResumoDTO implements Serializable {

    private long totalAssinaturas;
    private long assinaturasPagas;
    private long assinaturasPendentes;
    private long assinaturasAtrasadas;
    private BigDecimal receitaMensalPrevista;
    private BigDecimal receitaMensalRecebida;

    public long getTotalAssinaturas() {
        return totalAssinaturas;
    }

    public void setTotalAssinaturas(long totalAssinaturas) {
        this.totalAssinaturas = totalAssinaturas;
    }

    public long getAssinaturasPagas() {
        return assinaturasPagas;
    }

    public void setAssinaturasPagas(long assinaturasPagas) {
        this.assinaturasPagas = assinaturasPagas;
    }

    public long getAssinaturasPendentes() {
        return assinaturasPendentes;
    }

    public void setAssinaturasPendentes(long assinaturasPendentes) {
        this.assinaturasPendentes = assinaturasPendentes;
    }

    public long getAssinaturasAtrasadas() {
        return assinaturasAtrasadas;
    }

    public void setAssinaturasAtrasadas(long assinaturasAtrasadas) {
        this.assinaturasAtrasadas = assinaturasAtrasadas;
    }

    public BigDecimal getReceitaMensalPrevista() {
        return receitaMensalPrevista;
    }

    public void setReceitaMensalPrevista(BigDecimal receitaMensalPrevista) {
        this.receitaMensalPrevista = receitaMensalPrevista;
    }

    public BigDecimal getReceitaMensalRecebida() {
        return receitaMensalRecebida;
    }

    public void setReceitaMensalRecebida(BigDecimal receitaMensalRecebida) {
        this.receitaMensalRecebida = receitaMensalRecebida;
    }
}
