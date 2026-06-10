package br.com.semear.domain;

import br.com.semear.domain.enumeration.FormaPagamentoPlataforma;
import br.com.semear.domain.enumeration.StatusAssinatura;
import br.com.semear.domain.enumeration.StatusPagamentoPlataforma;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

@Entity
@Table(name = "assinatura_igreja")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class AssinaturaIgreja implements Serializable {

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

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "plano_id", nullable = false)
    private Plano plano;

    @NotNull
    @Column(name = "valor_mensal", nullable = false, precision = 19, scale = 2)
    private BigDecimal valorMensal;

    @Column(name = "data_vencimento")
    private LocalDate dataVencimento;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status_pagamento", nullable = false, length = 20)
    private StatusPagamentoPlataforma statusPagamento;

    @Column(name = "data_pagamento")
    private LocalDate dataPagamento;

    @Lob
    @Column(name = "observacao")
    private String observacao;

    @NotNull
    @Column(name = "data_cadastro", nullable = false)
    private Instant dataCadastro;

    @Column(name = "data_atualizacao")
    private Instant dataAtualizacao;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status_assinatura", nullable = false, length = 30)
    private StatusAssinatura statusAssinatura = StatusAssinatura.EM_TESTE;

    @Column(name = "data_inicio_teste")
    private LocalDate dataInicioTeste;

    @Column(name = "data_fim_teste")
    private LocalDate dataFimTeste;

    @Column(name = "data_ativacao")
    private LocalDate dataAtivacao;

    @Column(name = "data_suspensao")
    private LocalDate dataSuspensao;

    @Lob
    @Column(name = "motivo_suspensao")
    private String motivoSuspensao;

    @Column(name = "valor_implantacao_contratado", precision = 19, scale = 2)
    private BigDecimal valorImplantacaoContratado;

    @Column(name = "valor_mensal_contratado", precision = 19, scale = 2)
    private BigDecimal valorMensalContratado;

    @Column(name = "valor_anual_contratado", precision = 19, scale = 2)
    private BigDecimal valorAnualContratado;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_implantacao", length = 20)
    private StatusPagamentoPlataforma statusImplantacao = StatusPagamentoPlataforma.PENDENTE;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_mensalidade", length = 20)
    private StatusPagamentoPlataforma statusMensalidade = StatusPagamentoPlataforma.PENDENTE;

    @Enumerated(EnumType.STRING)
    @Column(name = "forma_pagamento", length = 20)
    private FormaPagamentoPlataforma formaPagamento;

    @Column(name = "proximo_vencimento")
    private LocalDate proximoVencimento;

    @Column(name = "responsavel_nome", length = 200)
    private String responsavelNome;

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

    public Plano getPlano() {
        return plano;
    }

    public void setPlano(Plano plano) {
        this.plano = plano;
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

    public Instant getDataAtualizacao() {
        return dataAtualizacao;
    }

    public void setDataAtualizacao(Instant dataAtualizacao) {
        this.dataAtualizacao = dataAtualizacao;
    }

    public StatusAssinatura getStatusAssinatura() {
        return statusAssinatura;
    }

    public void setStatusAssinatura(StatusAssinatura statusAssinatura) {
        this.statusAssinatura = statusAssinatura;
    }

    public LocalDate getDataInicioTeste() {
        return dataInicioTeste;
    }

    public void setDataInicioTeste(LocalDate dataInicioTeste) {
        this.dataInicioTeste = dataInicioTeste;
    }

    public LocalDate getDataFimTeste() {
        return dataFimTeste;
    }

    public void setDataFimTeste(LocalDate dataFimTeste) {
        this.dataFimTeste = dataFimTeste;
    }

    public LocalDate getDataAtivacao() {
        return dataAtivacao;
    }

    public void setDataAtivacao(LocalDate dataAtivacao) {
        this.dataAtivacao = dataAtivacao;
    }

    public LocalDate getDataSuspensao() {
        return dataSuspensao;
    }

    public void setDataSuspensao(LocalDate dataSuspensao) {
        this.dataSuspensao = dataSuspensao;
    }

    public String getMotivoSuspensao() {
        return motivoSuspensao;
    }

    public void setMotivoSuspensao(String motivoSuspensao) {
        this.motivoSuspensao = motivoSuspensao;
    }

    public BigDecimal getValorImplantacaoContratado() {
        return valorImplantacaoContratado;
    }

    public void setValorImplantacaoContratado(BigDecimal valorImplantacaoContratado) {
        this.valorImplantacaoContratado = valorImplantacaoContratado;
    }

    public BigDecimal getValorMensalContratado() {
        return valorMensalContratado;
    }

    public void setValorMensalContratado(BigDecimal valorMensalContratado) {
        this.valorMensalContratado = valorMensalContratado;
    }

    public BigDecimal getValorAnualContratado() {
        return valorAnualContratado;
    }

    public void setValorAnualContratado(BigDecimal valorAnualContratado) {
        this.valorAnualContratado = valorAnualContratado;
    }

    public StatusPagamentoPlataforma getStatusImplantacao() {
        return statusImplantacao;
    }

    public void setStatusImplantacao(StatusPagamentoPlataforma statusImplantacao) {
        this.statusImplantacao = statusImplantacao;
    }

    public StatusPagamentoPlataforma getStatusMensalidade() {
        return statusMensalidade;
    }

    public void setStatusMensalidade(StatusPagamentoPlataforma statusMensalidade) {
        this.statusMensalidade = statusMensalidade;
    }

    public FormaPagamentoPlataforma getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(FormaPagamentoPlataforma formaPagamento) {
        this.formaPagamento = formaPagamento;
    }

    public LocalDate getProximoVencimento() {
        return proximoVencimento;
    }

    public void setProximoVencimento(LocalDate proximoVencimento) {
        this.proximoVencimento = proximoVencimento;
    }

    public String getResponsavelNome() {
        return responsavelNome;
    }

    public void setResponsavelNome(String responsavelNome) {
        this.responsavelNome = responsavelNome;
    }
}
