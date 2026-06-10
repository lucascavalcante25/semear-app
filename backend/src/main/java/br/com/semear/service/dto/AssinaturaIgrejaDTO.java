package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.FormaPagamentoPlataforma;
import br.com.semear.domain.enumeration.StatusAssinatura;
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
    private StatusAssinatura statusAssinatura;
    private LocalDate dataInicioTeste;
    private LocalDate dataFimTeste;
    private LocalDate dataAtivacao;
    private LocalDate dataSuspensao;
    private String motivoSuspensao;
    private BigDecimal valorImplantacaoContratado;
    private BigDecimal valorMensalContratado;
    private BigDecimal valorAnualContratado;
    private StatusPagamentoPlataforma statusImplantacao;
    private StatusPagamentoPlataforma statusMensalidade;
    private FormaPagamentoPlataforma formaPagamento;
    private LocalDate proximoVencimento;
    private String responsavelNome;
    private Integer diasRestantesTeste;
    private Boolean acessoPermitido;

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

    public Integer getDiasRestantesTeste() {
        return diasRestantesTeste;
    }

    public void setDiasRestantesTeste(Integer diasRestantesTeste) {
        this.diasRestantesTeste = diasRestantesTeste;
    }

    public Boolean getAcessoPermitido() {
        return acessoPermitido;
    }

    public void setAcessoPermitido(Boolean acessoPermitido) {
        this.acessoPermitido = acessoPermitido;
    }
}
