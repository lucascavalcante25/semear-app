package br.com.semear.service.dto;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class CriancaDTO implements Serializable {

    private Long id;
    private Long igrejaId;
    private String nome;
    private LocalDate dataNascimento;
    private String observacoes;
    private String sala;
    private String alergias;
    private Boolean ativo;
    private List<CriancaResponsavelDTO> responsaveis = new ArrayList<>();
    private Boolean checkInHoje;
    private Boolean checkoutRegistrado;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getIgrejaId() { return igrejaId; }
    public void setIgrejaId(Long igrejaId) { this.igrejaId = igrejaId; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    public String getSala() { return sala; }
    public void setSala(String sala) { this.sala = sala; }
    public String getAlergias() { return alergias; }
    public void setAlergias(String alergias) { this.alergias = alergias; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
    public List<CriancaResponsavelDTO> getResponsaveis() { return responsaveis; }
    public void setResponsaveis(List<CriancaResponsavelDTO> responsaveis) { this.responsaveis = responsaveis; }
    public Boolean getCheckInHoje() { return checkInHoje; }
    public void setCheckInHoje(Boolean checkInHoje) { this.checkInHoje = checkInHoje; }
    public Boolean getCheckoutRegistrado() { return checkoutRegistrado; }
    public void setCheckoutRegistrado(Boolean checkoutRegistrado) { this.checkoutRegistrado = checkoutRegistrado; }
}
