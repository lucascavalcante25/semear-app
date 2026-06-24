package br.com.semear.service.dto;

import java.io.Serializable;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class EscalaDTO implements Serializable {

    private Long id;
    private Long igrejaId;
    private Long departamentoId;
    private String departamentoNome;
    private String titulo;
    private Instant dataEvento;
    private String observacao;
    private String status;
    private Long geracaoId;
    private Instant criadoEm;
    private List<EscalaItemDTO> itens = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getIgrejaId() { return igrejaId; }
    public void setIgrejaId(Long igrejaId) { this.igrejaId = igrejaId; }
    public Long getDepartamentoId() { return departamentoId; }
    public void setDepartamentoId(Long departamentoId) { this.departamentoId = departamentoId; }
    public String getDepartamentoNome() { return departamentoNome; }
    public void setDepartamentoNome(String departamentoNome) { this.departamentoNome = departamentoNome; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public Instant getDataEvento() { return dataEvento; }
    public void setDataEvento(Instant dataEvento) { this.dataEvento = dataEvento; }
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getGeracaoId() { return geracaoId; }
    public void setGeracaoId(Long geracaoId) { this.geracaoId = geracaoId; }
    public Instant getCriadoEm() { return criadoEm; }
    public void setCriadoEm(Instant criadoEm) { this.criadoEm = criadoEm; }
    public List<EscalaItemDTO> getItens() { return itens; }
    public void setItens(List<EscalaItemDTO> itens) { this.itens = itens; }
}
