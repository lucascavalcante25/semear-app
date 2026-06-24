package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.CodigoDepartamento;
import java.io.Serializable;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class DepartamentoDTO implements Serializable {

    private Long id;
    private Long igrejaId;
    private String nome;
    private String descricao;
    private CodigoDepartamento codigo;
    private String orientacoesServico;
    private Boolean ativo;
    private Instant criadoEm;
    private Long liderId;
    private String liderNome;
    private List<DepartamentoMembroDTO> membros = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getIgrejaId() { return igrejaId; }
    public void setIgrejaId(Long igrejaId) { this.igrejaId = igrejaId; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public CodigoDepartamento getCodigo() { return codigo; }
    public void setCodigo(CodigoDepartamento codigo) { this.codigo = codigo; }
    public String getOrientacoesServico() { return orientacoesServico; }
    public void setOrientacoesServico(String orientacoesServico) { this.orientacoesServico = orientacoesServico; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
    public Instant getCriadoEm() { return criadoEm; }
    public void setCriadoEm(Instant criadoEm) { this.criadoEm = criadoEm; }
    public Long getLiderId() { return liderId; }
    public void setLiderId(Long liderId) { this.liderId = liderId; }
    public String getLiderNome() { return liderNome; }
    public void setLiderNome(String liderNome) { this.liderNome = liderNome; }
    public List<DepartamentoMembroDTO> getMembros() { return membros; }
    public void setMembros(List<DepartamentoMembroDTO> membros) { this.membros = membros; }
}
