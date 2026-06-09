package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.Tema;
import java.io.Serializable;

/**
 * Dados públicos da igreja (sem informações sensíveis de PIX completo).
 */
public class IgrejaPublicaDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String nome;
    private String nomeFantasia;
    private String logoUrl;
    private String corPrimaria;
    private String corSecundaria;
    private Tema temaPreferido;
    private String textoBoasVindas;
    private String descricaoIgreja;
    private String cidade;
    private String estado;

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
}
