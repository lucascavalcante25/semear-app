package br.com.semear.service.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class IgrejaSitePublicoDTO implements Serializable {

    private Long id;
    private String slug;
    private String nome;
    private String subtituloIgreja;
    private String descricaoIgreja;
    private String logoUrl;
    private String corPrimaria;
    private String corSecundaria;
    private String textoBoasVindas;
    private String horarioCulto;
    private Boolean exibirAvisosPublicos;
    private String email;
    private String telefone;
    private String endereco;
    private String cidade;
    private String estado;
    private String cep;
    private List<EventoDTO> eventosPublicos = new ArrayList<>();
    private List<AvisoPublicoDTO> avisosPublicos = new ArrayList<>();

    public static class AvisoPublicoDTO implements Serializable {
        private Long id;
        private String titulo;
        private String conteudo;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitulo() { return titulo; }
        public void setTitulo(String titulo) { this.titulo = titulo; }
        public String getConteudo() { return conteudo; }
        public void setConteudo(String conteudo) { this.conteudo = conteudo; }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getSubtituloIgreja() { return subtituloIgreja; }
    public void setSubtituloIgreja(String subtituloIgreja) { this.subtituloIgreja = subtituloIgreja; }
    public String getDescricaoIgreja() { return descricaoIgreja; }
    public void setDescricaoIgreja(String descricaoIgreja) { this.descricaoIgreja = descricaoIgreja; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public String getCorPrimaria() { return corPrimaria; }
    public void setCorPrimaria(String corPrimaria) { this.corPrimaria = corPrimaria; }
    public String getCorSecundaria() { return corSecundaria; }
    public void setCorSecundaria(String corSecundaria) { this.corSecundaria = corSecundaria; }
    public String getTextoBoasVindas() { return textoBoasVindas; }
    public void setTextoBoasVindas(String textoBoasVindas) { this.textoBoasVindas = textoBoasVindas; }
    public String getHorarioCulto() { return horarioCulto; }
    public void setHorarioCulto(String horarioCulto) { this.horarioCulto = horarioCulto; }
    public Boolean getExibirAvisosPublicos() { return exibirAvisosPublicos; }
    public void setExibirAvisosPublicos(Boolean exibirAvisosPublicos) { this.exibirAvisosPublicos = exibirAvisosPublicos; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
    public String getCidade() { return cidade; }
    public void setCidade(String cidade) { this.cidade = cidade; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getCep() { return cep; }
    public void setCep(String cep) { this.cep = cep; }
    public List<EventoDTO> getEventosPublicos() { return eventosPublicos; }
    public void setEventosPublicos(List<EventoDTO> eventosPublicos) { this.eventosPublicos = eventosPublicos; }
    public List<AvisoPublicoDTO> getAvisosPublicos() { return avisosPublicos; }
    public void setAvisosPublicos(List<AvisoPublicoDTO> avisosPublicos) { this.avisosPublicos = avisosPublicos; }
}
