package br.com.semear.domain;

import br.com.semear.domain.enumeration.TipoAcompanhamentoPastoral;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "acompanhamento_pastoral")
public class AcompanhamentoPastoral implements Serializable {

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
    @JoinColumn(name = "membro_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler", "password", "authorities" }, allowSetters = true)
    private User membro;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsavel_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler", "password", "authorities" }, allowSetters = true)
    private User responsavel;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 30)
    private TipoAcompanhamentoPastoral tipo;

    @Column(name = "observacao", columnDefinition = "text")
    private String observacao;

    @NotNull
    @Column(name = "data_contato", nullable = false)
    private LocalDate dataContato;

    @Column(name = "data_retorno")
    private LocalDate dataRetorno;

    @NotNull
    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm = Instant.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "criado_por_id")
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler", "password", "authorities" }, allowSetters = true)
    private User criadoPor;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Igreja getIgreja() { return igreja; }
    public void setIgreja(Igreja igreja) { this.igreja = igreja; }
    public User getMembro() { return membro; }
    public void setMembro(User membro) { this.membro = membro; }
    public User getResponsavel() { return responsavel; }
    public void setResponsavel(User responsavel) { this.responsavel = responsavel; }
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
    public User getCriadoPor() { return criadoPor; }
    public void setCriadoPor(User criadoPor) { this.criadoPor = criadoPor; }
}
