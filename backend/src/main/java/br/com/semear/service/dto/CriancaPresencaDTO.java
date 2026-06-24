package br.com.semear.service.dto;

import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;

public class CriancaPresencaDTO implements Serializable {

    private Long id;
    private Long criancaId;
    private String criancaNome;
    private LocalDate dataPresenca;
    private Instant entradaEm;
    private Instant saidaEm;
    private Boolean presente;
    private Boolean saidaRegistrada;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCriancaId() {
        return criancaId;
    }

    public void setCriancaId(Long criancaId) {
        this.criancaId = criancaId;
    }

    public String getCriancaNome() {
        return criancaNome;
    }

    public void setCriancaNome(String criancaNome) {
        this.criancaNome = criancaNome;
    }

    public LocalDate getDataPresenca() {
        return dataPresenca;
    }

    public void setDataPresenca(LocalDate dataPresenca) {
        this.dataPresenca = dataPresenca;
    }

    public Instant getEntradaEm() {
        return entradaEm;
    }

    public void setEntradaEm(Instant entradaEm) {
        this.entradaEm = entradaEm;
    }

    public Instant getSaidaEm() {
        return saidaEm;
    }

    public void setSaidaEm(Instant saidaEm) {
        this.saidaEm = saidaEm;
    }

    public Boolean getPresente() {
        return presente;
    }

    public void setPresente(Boolean presente) {
        this.presente = presente;
    }

    public Boolean getSaidaRegistrada() {
        return saidaRegistrada;
    }

    public void setSaidaRegistrada(Boolean saidaRegistrada) {
        this.saidaRegistrada = saidaRegistrada;
    }
}
