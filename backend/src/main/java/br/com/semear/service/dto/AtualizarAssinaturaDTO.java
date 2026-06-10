package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.FormaPagamentoPlataforma;
import java.io.Serializable;
import java.time.LocalDate;

public class AtualizarAssinaturaDTO implements Serializable {

    private String observacao;
    private LocalDate proximoVencimento;
    private FormaPagamentoPlataforma formaPagamento;

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public LocalDate getProximoVencimento() {
        return proximoVencimento;
    }

    public void setProximoVencimento(LocalDate proximoVencimento) {
        this.proximoVencimento = proximoVencimento;
    }

    public FormaPagamentoPlataforma getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(FormaPagamentoPlataforma formaPagamento) {
        this.formaPagamento = formaPagamento;
    }
}
