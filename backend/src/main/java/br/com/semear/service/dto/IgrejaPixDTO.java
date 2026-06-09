package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.TipoChavePix;
import java.io.Serializable;

public class IgrejaPixDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String nome;
    private String nomeFantasia;
    private String cnpj;
    private String logoUrl;
    private String chavePix;
    private TipoChavePix tipoChavePix;
    private String nomeTitularPix;
    private String bancoPix;
    private String documentoTitularPix;
    private String textoAgradecimentoOferta;
    private String cidade;

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

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
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

    public String getTextoAgradecimentoOferta() {
        return textoAgradecimentoOferta;
    }

    public void setTextoAgradecimentoOferta(String textoAgradecimentoOferta) {
        this.textoAgradecimentoOferta = textoAgradecimentoOferta;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }
}
