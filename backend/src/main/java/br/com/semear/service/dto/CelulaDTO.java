package br.com.semear.service.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class CelulaDTO implements Serializable {

    private Long id;
    private Long igrejaId;
    private String nome;
    private Long liderId;
    private String liderNome;
    private Long auxiliarId;
    private String auxiliarNome;
    private String endereco;
    private String diaSemana;
    private String horario;
    private Boolean ativo;
    private List<CelulaMembroDTO> membros = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getIgrejaId() { return igrejaId; }
    public void setIgrejaId(Long igrejaId) { this.igrejaId = igrejaId; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public Long getLiderId() { return liderId; }
    public void setLiderId(Long liderId) { this.liderId = liderId; }
    public String getLiderNome() { return liderNome; }
    public void setLiderNome(String liderNome) { this.liderNome = liderNome; }
    public Long getAuxiliarId() { return auxiliarId; }
    public void setAuxiliarId(Long auxiliarId) { this.auxiliarId = auxiliarId; }
    public String getAuxiliarNome() { return auxiliarNome; }
    public void setAuxiliarNome(String auxiliarNome) { this.auxiliarNome = auxiliarNome; }
    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
    public String getDiaSemana() { return diaSemana; }
    public void setDiaSemana(String diaSemana) { this.diaSemana = diaSemana; }
    public String getHorario() { return horario; }
    public void setHorario(String horario) { this.horario = horario; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
    public List<CelulaMembroDTO> getMembros() { return membros; }
    public void setMembros(List<CelulaMembroDTO> membros) { this.membros = membros; }
}
