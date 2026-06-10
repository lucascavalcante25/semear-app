package br.com.semear.domain;

import br.com.semear.domain.enumeration.FormaPagamentoPlataforma;
import br.com.semear.domain.enumeration.StatusPagamentoPlataforma;
import br.com.semear.domain.enumeration.TipoPagamentoPlataforma;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

@Entity
@Table(name = "pagamento_plataforma")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PagamentoPlataforma implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "igreja_id", nullable = false)
    private Igreja igreja;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assinatura_id")
    private AssinaturaIgreja assinatura;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_pagamento", nullable = false, length = 20)
    private TipoPagamentoPlataforma tipoPagamento;

    @NotNull
    @Column(name = "valor", nullable = false, precision = 19, scale = 2)
    private BigDecimal valor;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StatusPagamentoPlataforma status;

    @Enumerated(EnumType.STRING)
    @Column(name = "forma_pagamento", length = 20)
    private FormaPagamentoPlataforma formaPagamento;

    @Column(name = "data_vencimento")
    private LocalDate dataVencimento;

    @Column(name = "data_pagamento")
    private LocalDate dataPagamento;

    @Column(name = "referencia_mes", length = 7)
    private String referenciaMes;

    @Lob
    @Column(name = "observacao")
    private String observacao;

    @Column(name = "registrado_por", length = 100)
    private String registradoPor;

    @NotNull
    @Column(name = "data_cadastro", nullable = false)
    private Instant dataCadastro;

    @Column(name = "data_atualizacao")
    private Instant dataAtualizacao;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Igreja getIgreja() {
        return igreja;
    }

    public void setIgreja(Igreja igreja) {
        this.igreja = igreja;
    }

    public AssinaturaIgreja getAssinatura() {
        return assinatura;
    }

    public void setAssinatura(AssinaturaIgreja assinatura) {
        this.assinatura = assinatura;
    }

    public TipoPagamentoPlataforma getTipoPagamento() {
        return tipoPagamento;
    }

    public void setTipoPagamento(TipoPagamentoPlataforma tipoPagamento) {
        this.tipoPagamento = tipoPagamento;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public StatusPagamentoPlataforma getStatus() {
        return status;
    }

    public void setStatus(StatusPagamentoPlataforma status) {
        this.status = status;
    }

    public FormaPagamentoPlataforma getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(FormaPagamentoPlataforma formaPagamento) {
        this.formaPagamento = formaPagamento;
    }

    public LocalDate getDataVencimento() {
        return dataVencimento;
    }

    public void setDataVencimento(LocalDate dataVencimento) {
        this.dataVencimento = dataVencimento;
    }

    public LocalDate getDataPagamento() {
        return dataPagamento;
    }

    public void setDataPagamento(LocalDate dataPagamento) {
        this.dataPagamento = dataPagamento;
    }

    public String getReferenciaMes() {
        return referenciaMes;
    }

    public void setReferenciaMes(String referenciaMes) {
        this.referenciaMes = referenciaMes;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public String getRegistradoPor() {
        return registradoPor;
    }

    public void setRegistradoPor(String registradoPor) {
        this.registradoPor = registradoPor;
    }

    public Instant getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(Instant dataCadastro) {
        this.dataCadastro = dataCadastro;
    }

    public Instant getDataAtualizacao() {
        return dataAtualizacao;
    }

    public void setDataAtualizacao(Instant dataAtualizacao) {
        this.dataAtualizacao = dataAtualizacao;
    }
}
