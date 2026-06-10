package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.StatusIgreja;
import br.com.semear.domain.enumeration.Tema;
import br.com.semear.domain.enumeration.TipoChavePix;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;

public class IgrejaDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String nome;
    private String nomeFantasia;
    private String cnpj;
    private String email;
    private String telefone;
    private String cep;
    private String endereco;
    private String numero;
    private String bairro;
    private String cidade;
    private String estado;
    private String complemento;
    private String nomePastorResponsavel;
    private String cpfPastorResponsavel;
    private String telefoneResponsavel;
    private String emailResponsavel;
    private String chavePix;
    private TipoChavePix tipoChavePix;
    private String nomeTitularPix;
    private String bancoPix;
    private String documentoTitularPix;
    private String logoUrl;
    private String corPrimaria;
    private String corSecundaria;
    private Tema temaPreferido;
    private String textoBoasVindas;
    private String descricaoIgreja;
    private String subtituloIgreja;
    private String textoAgradecimentoOferta;
    private StatusIgreja status;
    private Instant dataCadastro;
    private Instant dataAtualizacao;
    private LocalDate dataInicioPlanoLeitura;
    private Integer cicloPlanoLeitura;

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

    public String getNomeFantasia() {
        return nomeFantasia;
    }

    public void setNomeFantasia(String nomeFantasia) {
        this.nomeFantasia = nomeFantasia;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getBairro() {
        return bairro;
    }

    public void setBairro(String bairro) {
        this.bairro = bairro;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getComplemento() {
        return complemento;
    }

    public void setComplemento(String complemento) {
        this.complemento = complemento;
    }

    public String getNomePastorResponsavel() {
        return nomePastorResponsavel;
    }

    public void setNomePastorResponsavel(String nomePastorResponsavel) {
        this.nomePastorResponsavel = nomePastorResponsavel;
    }

    public String getCpfPastorResponsavel() {
        return cpfPastorResponsavel;
    }

    public void setCpfPastorResponsavel(String cpfPastorResponsavel) {
        this.cpfPastorResponsavel = cpfPastorResponsavel;
    }

    public String getTelefoneResponsavel() {
        return telefoneResponsavel;
    }

    public void setTelefoneResponsavel(String telefoneResponsavel) {
        this.telefoneResponsavel = telefoneResponsavel;
    }

    public String getEmailResponsavel() {
        return emailResponsavel;
    }

    public void setEmailResponsavel(String emailResponsavel) {
        this.emailResponsavel = emailResponsavel;
    }

    public String getChavePix() {
        return chavePix;
    }

    public void setChavePix(String chavePix) {
        this.chavePix = chavePix;
    }

    public TipoChavePix getTipoChavePix() {
        return tipoChavePix;
    }

    public void setTipoChavePix(TipoChavePix tipoChavePix) {
        this.tipoChavePix = tipoChavePix;
    }

    public String getNomeTitularPix() {
        return nomeTitularPix;
    }

    public void setNomeTitularPix(String nomeTitularPix) {
        this.nomeTitularPix = nomeTitularPix;
    }

    public String getBancoPix() {
        return bancoPix;
    }

    public void setBancoPix(String bancoPix) {
        this.bancoPix = bancoPix;
    }

    public String getDocumentoTitularPix() {
        return documentoTitularPix;
    }

    public void setDocumentoTitularPix(String documentoTitularPix) {
        this.documentoTitularPix = documentoTitularPix;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getCorPrimaria() {
        return corPrimaria;
    }

    public void setCorPrimaria(String corPrimaria) {
        this.corPrimaria = corPrimaria;
    }

    public String getCorSecundaria() {
        return corSecundaria;
    }

    public void setCorSecundaria(String corSecundaria) {
        this.corSecundaria = corSecundaria;
    }

    public Tema getTemaPreferido() {
        return temaPreferido;
    }

    public void setTemaPreferido(Tema temaPreferido) {
        this.temaPreferido = temaPreferido;
    }

    public String getTextoBoasVindas() {
        return textoBoasVindas;
    }

    public void setTextoBoasVindas(String textoBoasVindas) {
        this.textoBoasVindas = textoBoasVindas;
    }

    public String getDescricaoIgreja() {
        return descricaoIgreja;
    }

    public void setDescricaoIgreja(String descricaoIgreja) {
        this.descricaoIgreja = descricaoIgreja;
    }

    public String getSubtituloIgreja() {
        return subtituloIgreja;
    }

    public void setSubtituloIgreja(String subtituloIgreja) {
        this.subtituloIgreja = subtituloIgreja;
    }

    public String getTextoAgradecimentoOferta() {
        return textoAgradecimentoOferta;
    }

    public void setTextoAgradecimentoOferta(String textoAgradecimentoOferta) {
        this.textoAgradecimentoOferta = textoAgradecimentoOferta;
    }

    public StatusIgreja getStatus() {
        return status;
    }

    public void setStatus(StatusIgreja status) {
        this.status = status;
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

    public LocalDate getDataInicioPlanoLeitura() {
        return dataInicioPlanoLeitura;
    }

    public void setDataInicioPlanoLeitura(LocalDate dataInicioPlanoLeitura) {
        this.dataInicioPlanoLeitura = dataInicioPlanoLeitura;
    }

    public Integer getCicloPlanoLeitura() {
        return cicloPlanoLeitura;
    }

    public void setCicloPlanoLeitura(Integer cicloPlanoLeitura) {
        this.cicloPlanoLeitura = cicloPlanoLeitura;
    }
}
