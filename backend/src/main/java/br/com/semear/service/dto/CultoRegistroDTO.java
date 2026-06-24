package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.DiaSemanaCulto;
import br.com.semear.domain.enumeration.RegraGeneroEscala;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class CultoRegistroDTO implements Serializable {

    private Long id;
    private String nome;
    private DiaSemanaCulto diaSemana;
    private String horario;
    private Boolean ativo;
    private List<CultoEscalaRegraDTO> regras = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public DiaSemanaCulto getDiaSemana() { return diaSemana; }
    public void setDiaSemana(DiaSemanaCulto diaSemana) { this.diaSemana = diaSemana; }
    public String getHorario() { return horario; }
    public void setHorario(String horario) { this.horario = horario; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
    public List<CultoEscalaRegraDTO> getRegras() { return regras; }
    public void setRegras(List<CultoEscalaRegraDTO> regras) { this.regras = regras; }
}
