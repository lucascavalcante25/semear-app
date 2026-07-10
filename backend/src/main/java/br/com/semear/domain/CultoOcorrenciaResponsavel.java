package br.com.semear.domain;

import br.com.semear.domain.enumeration.PapelCultoResponsavel;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;

@Entity
@Table(name = "culto_ocorrencia_responsavel")
public class CultoOcorrenciaResponsavel implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "culto_ocorrencia_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler" }, allowSetters = true)
    private CultoOcorrencia cultoOcorrencia;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "papel", nullable = false, length = 30)
    private PapelCultoResponsavel papel;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler", "password", "authorities" }, allowSetters = true)
    private User user;

    @NotNull
    @Column(name = "origem_manual", nullable = false)
    private Boolean origemManual = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CultoOcorrencia getCultoOcorrencia() { return cultoOcorrencia; }
    public void setCultoOcorrencia(CultoOcorrencia cultoOcorrencia) { this.cultoOcorrencia = cultoOcorrencia; }
    public PapelCultoResponsavel getPapel() { return papel; }
    public void setPapel(PapelCultoResponsavel papel) { this.papel = papel; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Boolean getOrigemManual() { return origemManual; }
    public void setOrigemManual(Boolean origemManual) { this.origemManual = origemManual; }
}
