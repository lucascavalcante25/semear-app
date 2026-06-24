package br.com.semear.domain;

import br.com.semear.domain.enumeration.EstadoFunilVisitante;
import br.com.semear.domain.enumeration.FormaChegadaVisitante;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * Registro de visitante.
 */
@Entity
@Table(name = "visitante")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Visitante implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "telefone")
    private String telefone;

    @NotNull
    @Column(name = "data_visita", nullable = false)
    private LocalDate dataVisita;

    @Column(name = "como_conheceu")
    private String comoConheceu;

    @Column(name = "observacoes", columnDefinition = "text")
    private String observacoes;

    @Enumerated(EnumType.STRING)
    @Column(name = "forma_chegada")
    private FormaChegadaVisitante formaChegada;

    @Column(name = "acompanhante_nome")
    private String acompanhanteNome;

    @Column(name = "igreja_origem")
    private String igrejaOrigem;

    @Column(name = "convidado_por")
    private String convidadoPor;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "estado_funil", nullable = false, length = 30)
    private EstadoFunilVisitante estadoFunil = EstadoFunilVisitante.CADASTRADO;

    @Column(name = "data_proximo_contato")
    private LocalDate dataProximoContato;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "igreja_id")
    private Igreja igreja;

    @NotNull
    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm;

    @Column(name = "criado_por")
    private String criadoPor;

    @Column(name = "atualizado_em")
    private Instant atualizadoEm;

    @Column(name = "atualizado_por")
    private String atualizadoPor;

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

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public LocalDate getDataVisita() {
        return dataVisita;
    }

    public void setDataVisita(LocalDate dataVisita) {
        this.dataVisita = dataVisita;
    }

    public String getComoConheceu() {
        return comoConheceu;
    }

    public void setComoConheceu(String comoConheceu) {
        this.comoConheceu = comoConheceu;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public FormaChegadaVisitante getFormaChegada() {
        return formaChegada;
    }

    public void setFormaChegada(FormaChegadaVisitante formaChegada) {
        this.formaChegada = formaChegada;
    }

    public String getAcompanhanteNome() {
        return acompanhanteNome;
    }

    public void setAcompanhanteNome(String acompanhanteNome) {
        this.acompanhanteNome = acompanhanteNome;
    }

    public String getIgrejaOrigem() {
        return igrejaOrigem;
    }

    public void setIgrejaOrigem(String igrejaOrigem) {
        this.igrejaOrigem = igrejaOrigem;
    }

    public String getConvidadoPor() {
        return convidadoPor;
    }

    public void setConvidadoPor(String convidadoPor) {
        this.convidadoPor = convidadoPor;
    }

    public EstadoFunilVisitante getEstadoFunil() {
        return estadoFunil;
    }

    public void setEstadoFunil(EstadoFunilVisitante estadoFunil) {
        this.estadoFunil = estadoFunil;
    }

    public LocalDate getDataProximoContato() {
        return dataProximoContato;
    }

    public void setDataProximoContato(LocalDate dataProximoContato) {
        this.dataProximoContato = dataProximoContato;
    }

    public Igreja getIgreja() {
        return igreja;
    }

    public void setIgreja(Igreja igreja) {
        this.igreja = igreja;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(Instant criadoEm) {
        this.criadoEm = criadoEm;
    }

    public String getCriadoPor() {
        return criadoPor;
    }

    public void setCriadoPor(String criadoPor) {
        this.criadoPor = criadoPor;
    }

    public Instant getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setAtualizadoEm(Instant atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }

    public String getAtualizadoPor() {
        return atualizadoPor;
    }

    public void setAtualizadoPor(String atualizadoPor) {
        this.atualizadoPor = atualizadoPor;
    }
}

