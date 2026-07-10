package br.com.semear.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "culto_ocorrencia")
public class CultoOcorrencia implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "igreja_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler" }, allowSetters = true)
    private Igreja igreja;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "culto_registro_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler" }, allowSetters = true)
    private CultoRegistro cultoRegistro;

    @NotNull
    @Column(name = "data_evento", nullable = false)
    private LocalDate dataEvento;

    @Column(name = "pregador", length = 200)
    private String pregador;

    @Column(name = "titulo_mensagem", length = 300)
    private String tituloMensagem;

    @Column(name = "versiculo_central", length = 500)
    private String versiculoCentral;

    @Column(name = "observacoes", columnDefinition = "text")
    private String observacoes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grupo_louvor_origem_id")
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler" }, allowSetters = true)
    private GrupoLouvor grupoLouvorOrigem;

    @NotNull
    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm = Instant.now();

    @Column(name = "atualizado_em")
    private Instant atualizadoEm;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Igreja getIgreja() { return igreja; }
    public void setIgreja(Igreja igreja) { this.igreja = igreja; }
    public CultoRegistro getCultoRegistro() { return cultoRegistro; }
    public void setCultoRegistro(CultoRegistro cultoRegistro) { this.cultoRegistro = cultoRegistro; }
    public LocalDate getDataEvento() { return dataEvento; }
    public void setDataEvento(LocalDate dataEvento) { this.dataEvento = dataEvento; }
    public String getPregador() { return pregador; }
    public void setPregador(String pregador) { this.pregador = pregador; }
    public String getTituloMensagem() { return tituloMensagem; }
    public void setTituloMensagem(String tituloMensagem) { this.tituloMensagem = tituloMensagem; }
    public String getVersiculoCentral() { return versiculoCentral; }
    public void setVersiculoCentral(String versiculoCentral) { this.versiculoCentral = versiculoCentral; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    public GrupoLouvor getGrupoLouvorOrigem() { return grupoLouvorOrigem; }
    public void setGrupoLouvorOrigem(GrupoLouvor grupoLouvorOrigem) { this.grupoLouvorOrigem = grupoLouvorOrigem; }
    public Instant getCriadoEm() { return criadoEm; }
    public void setCriadoEm(Instant criadoEm) { this.criadoEm = criadoEm; }
    public Instant getAtualizadoEm() { return atualizadoEm; }
    public void setAtualizadoEm(Instant atualizadoEm) { this.atualizadoEm = atualizadoEm; }
}
