package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.TipoAcompanhamentoPastoral;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;

public class AcompanhamentoPastoralDTO implements Serializable {

    private Long id;
    private Long igrejaId;
    private Long membroId;
    private String membroNome;
    private Long responsavelId;
    private String responsavelNome;
    private TipoAcompanhamentoPastoral tipo;
    private String observacao;
    private LocalDate dataContato;
    private LocalDate dataRetorno;
    private Instant criadoEm;
    private Long criadoPorId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getIgrejaId() { return igrejaId; }
    public void setIgrejaId(Long igrejaId) { this.igrejaId = igrejaId; }
    public Long getMembroId() { return membroId; }
    public void setMembroId(Long membroId) { this.membroId = membroId; }
    public String getMembroNome() { return membroNome; }
    public void setMembroNome(String membroNome) { this.membroNome = membroNome; }
    public Long getResponsavelId() { return responsavelId; }
    public void setResponsavelId(Long responsavelId) { this.responsavelId = responsavelId; }
    public String getResponsavelNome() { return responsavelNome; }
    public void setResponsavelNome(String responsavelNome) { this.responsavelNome = responsavelNome; }
    public TipoAcompanhamentoPastoral getTipo() { return tipo; }
    public void setTipo(TipoAcompanhamentoPastoral tipo) { this.tipo = tipo; }
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
    public LocalDate getDataContato() { return dataContato; }
    public void setDataContato(LocalDate dataContato) { this.dataContato = dataContato; }
    public LocalDate getDataRetorno() { return dataRetorno; }
    public void setDataRetorno(LocalDate dataRetorno) { this.dataRetorno = dataRetorno; }
    public Instant getCriadoEm() { return criadoEm; }
    public void setCriadoEm(Instant criadoEm) { this.criadoEm = criadoEm; }
    public Long getCriadoPorId() { return criadoPorId; }
    public void setCriadoPorId(Long criadoPorId) { this.criadoPorId = criadoPorId; }
}
