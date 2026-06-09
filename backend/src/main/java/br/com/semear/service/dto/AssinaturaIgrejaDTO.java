package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.StatusPagamentoPlataforma;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public class AssinaturaIgrejaDTO implements Serializable {

    private Long id;
    private Long igrejaId;
    private String igrejaNome;
    private Long planoId;
    private String planoNome;
    private BigDecimal valorMensal;
    private LocalDate dataVencimento;
    private StatusPagamentoPlataforma statusPagamento;
    private LocalDate dataPagamento;
    private String observacao;
    private Instant dataCadastro;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIgrejaId() {
        return igrejaId;
    }

    public void setIgrejaId(Long igrejaId) {
        this.igrejaId = igrejaId;
    }

    public String getIgrejaNome() {
        return igrejaNome;
    }

    public void setIgrejaNome(String igrejaNome) {
        this.igrejaNome = igrejaNome;
    }

    public Long getPlanoId() {
        return planoId;
    }

    public void setPlanoId(Long planoId) {
        this.planoId = planoId;
    }

    public String getPlanoNome() {
        return planoNome;
    }

    public void setPlanoNome(String planoNome) {
        this.planoNome = planoNome;
    }

    public BigDecimal getValorMensal() {
        return valorMensal;
    }

    public void setValorMensal(BigDecimal valorMensal) {
        this.valorMensal = valorMensal;
    }

    public LocalDate getDataVencimento() {
        return dataVencimento;
    }

    public void setDataVencimento(LocalDate dataVencimento) {
        this.dataVencimento = dataVencimento;
    }

    public StatusPagamentoPlataforma getStatusPagamento() {
        return statusPagamento;
    }

    public void setStatusPagamento(StatusPagamentoPlataforma statusPagamento) {
        this.statusPagamento = statusPagamento;
    }

    public LocalDate getDataPagamento() {
        return dataPagamento;
    }

    public void setDataPagamento(LocalDate dataPagamento) {
        this.dataPagamento = dataPagamento;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public Instant getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(Instant dataCadastro) {
        this.dataCadastro = dataCadastro;
    }
}
