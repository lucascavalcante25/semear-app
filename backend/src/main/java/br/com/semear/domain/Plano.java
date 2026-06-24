package br.com.semear.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

@Entity
@Table(name = "plano")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Plano implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    @Column(name = "descricao", columnDefinition = "text")
    private String descricao;

    @NotNull
    @Column(name = "valor_mensal", nullable = false, precision = 19, scale = 2)
    private BigDecimal valorMensal;

    @NotNull
    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "valor_anual", precision = 19, scale = 2)
    private BigDecimal valorAnual;

    @Column(name = "valor_implantacao", precision = 19, scale = 2)
    private BigDecimal valorImplantacao;

    @Column(name = "dias_trial")
    private Integer diasTrial;

    @Column(name = "limite_membros")
    private Integer limiteMembros;

    @Column(name = "destaque")
    private Boolean destaque = true;

    @Column(name = "texto_botao", length = 80)
    private String textoBotao;

    @Column(name = "ordem_exibicao")
    private Integer ordemExibicao = 1;

    @NotNull
    @Column(name = "data_cadastro", nullable = false)
    private Instant dataCadastro;

    @Column(name = "data_atualizacao")
    private Instant dataAtualizacao;

    @Column(name = "promocao_implantacao_anual", precision = 19, scale = 2)
    private BigDecimal promocaoImplantacaoAnual;

    @Column(name = "desconto_anual_percentual")
    private Integer descontoAnualPercentual;

    @Column(name = "mensagem_abordagem", columnDefinition = "text")
    private String mensagemAbordagem;

    @Column(name = "mensagem_preco", columnDefinition = "text")
    private String mensagemPreco;

    @Column(name = "mensagem_demo", columnDefinition = "text")
    private String mensagemDemo;

    @Column(name = "mensagem_fim_teste", columnDefinition = "text")
    private String mensagemFimTeste;

    @Column(name = "whatsapp_contato", length = 30)
    private String whatsappContato;

    @Column(name = "email_contato", length = 100)
    private String emailContato;

    @Column(name = "link_pagamento_mensal", length = 500)
    private String linkPagamentoMensal;

    @Column(name = "link_pagamento_implantacao", length = 500)
    private String linkPagamentoImplantacao;

    @Column(name = "link_pagamento_anual", length = 500)
    private String linkPagamentoAnual;

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

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public BigDecimal getValorMensal() {
        return valorMensal;
    }

    public void setValorMensal(BigDecimal valorMensal) {
        this.valorMensal = valorMensal;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public Instant getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(Instant dataCadastro) {
        this.dataCadastro = dataCadastro;
    }

    public BigDecimal getValorAnual() {
        return valorAnual;
    }

    public void setValorAnual(BigDecimal valorAnual) {
        this.valorAnual = valorAnual;
    }

    public BigDecimal getValorImplantacao() {
        return valorImplantacao;
    }

    public void setValorImplantacao(BigDecimal valorImplantacao) {
        this.valorImplantacao = valorImplantacao;
    }

    public Integer getDiasTrial() {
        return diasTrial;
    }

    public void setDiasTrial(Integer diasTrial) {
        this.diasTrial = diasTrial;
    }

    public Integer getLimiteMembros() {
        return limiteMembros;
    }

    public void setLimiteMembros(Integer limiteMembros) {
        this.limiteMembros = limiteMembros;
    }

    public Boolean getDestaque() {
        return destaque;
    }

    public void setDestaque(Boolean destaque) {
        this.destaque = destaque;
    }

    public String getTextoBotao() {
        return textoBotao;
    }

    public void setTextoBotao(String textoBotao) {
        this.textoBotao = textoBotao;
    }

    public Integer getOrdemExibicao() {
        return ordemExibicao;
    }

    public void setOrdemExibicao(Integer ordemExibicao) {
        this.ordemExibicao = ordemExibicao;
    }

    public Instant getDataAtualizacao() {
        return dataAtualizacao;
    }

    public void setDataAtualizacao(Instant dataAtualizacao) {
        this.dataAtualizacao = dataAtualizacao;
    }

    public BigDecimal getPromocaoImplantacaoAnual() {
        return promocaoImplantacaoAnual;
    }

    public void setPromocaoImplantacaoAnual(BigDecimal promocaoImplantacaoAnual) {
        this.promocaoImplantacaoAnual = promocaoImplantacaoAnual;
    }

    public Integer getDescontoAnualPercentual() {
        return descontoAnualPercentual;
    }

    public void setDescontoAnualPercentual(Integer descontoAnualPercentual) {
        this.descontoAnualPercentual = descontoAnualPercentual;
    }

    public String getMensagemAbordagem() {
        return mensagemAbordagem;
    }

    public void setMensagemAbordagem(String mensagemAbordagem) {
        this.mensagemAbordagem = mensagemAbordagem;
    }

    public String getMensagemPreco() {
        return mensagemPreco;
    }

    public void setMensagemPreco(String mensagemPreco) {
        this.mensagemPreco = mensagemPreco;
    }

    public String getMensagemDemo() {
        return mensagemDemo;
    }

    public void setMensagemDemo(String mensagemDemo) {
        this.mensagemDemo = mensagemDemo;
    }

    public String getMensagemFimTeste() {
        return mensagemFimTeste;
    }

    public void setMensagemFimTeste(String mensagemFimTeste) {
        this.mensagemFimTeste = mensagemFimTeste;
    }

    public String getWhatsappContato() {
        return whatsappContato;
    }

    public void setWhatsappContato(String whatsappContato) {
        this.whatsappContato = whatsappContato;
    }

    public String getEmailContato() {
        return emailContato;
    }

    public void setEmailContato(String emailContato) {
        this.emailContato = emailContato;
    }

    public String getLinkPagamentoMensal() {
        return linkPagamentoMensal;
    }

    public void setLinkPagamentoMensal(String linkPagamentoMensal) {
        this.linkPagamentoMensal = linkPagamentoMensal;
    }

    public String getLinkPagamentoImplantacao() {
        return linkPagamentoImplantacao;
    }

    public void setLinkPagamentoImplantacao(String linkPagamentoImplantacao) {
        this.linkPagamentoImplantacao = linkPagamentoImplantacao;
    }

    public String getLinkPagamentoAnual() {
        return linkPagamentoAnual;
    }

    public void setLinkPagamentoAnual(String linkPagamentoAnual) {
        this.linkPagamentoAnual = linkPagamentoAnual;
    }
}
