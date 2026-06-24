package br.com.semear.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import br.com.semear.domain.enumeration.DiaSemanaCulto;
import br.com.semear.domain.enumeration.ModoLimpezaEscala;
import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "escala_config_automatica")
public class EscalaConfigAutomatica implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "igreja_id", nullable = false, unique = true)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler" }, allowSetters = true)
    private Igreja igreja;

    @NotNull
    @Column(name = "meses_ciclo", nullable = false)
    private Integer mesesCiclo = 3;

    @NotNull
    @Column(name = "dias_antecedencia", nullable = false)
    private Integer diasAntecedencia = 14;

    @NotNull
    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "atualizado_em")
    private Instant atualizadoEm;

    @NotNull
    @Column(name = "gerar_portaria", nullable = false)
    private Boolean gerarPortaria = true;

    @NotNull
    @Column(name = "gerar_recepcao", nullable = false)
    private Boolean gerarRecepcao = true;

    @NotNull
    @Column(name = "gerar_limpeza", nullable = false)
    private Boolean gerarLimpeza = false;

    @NotNull
    @Column(name = "agrupar_portaria_recepcao", nullable = false)
    private Boolean agruparPortariaRecepcao = false;

    @NotNull
    @Column(name = "limpeza_mensal", nullable = false)
    private Boolean limpezaMensal = true;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "modo_limpeza", nullable = false)
    private ModoLimpezaEscala modoLimpeza = ModoLimpezaEscala.MENSAL;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "dia_semana_limpeza", nullable = false)
    private DiaSemanaCulto diaSemanaLimpeza = DiaSemanaCulto.DOMINGO;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Igreja getIgreja() { return igreja; }
    public void setIgreja(Igreja igreja) { this.igreja = igreja; }
    public Integer getMesesCiclo() { return mesesCiclo; }
    public void setMesesCiclo(Integer mesesCiclo) { this.mesesCiclo = mesesCiclo; }
    public Integer getDiasAntecedencia() { return diasAntecedencia; }
    public void setDiasAntecedencia(Integer diasAntecedencia) { this.diasAntecedencia = diasAntecedencia; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
    public Instant getAtualizadoEm() { return atualizadoEm; }
    public void setAtualizadoEm(Instant atualizadoEm) { this.atualizadoEm = atualizadoEm; }
    public Boolean getGerarPortaria() { return gerarPortaria; }
    public void setGerarPortaria(Boolean gerarPortaria) { this.gerarPortaria = gerarPortaria; }
    public Boolean getGerarRecepcao() { return gerarRecepcao; }
    public void setGerarRecepcao(Boolean gerarRecepcao) { this.gerarRecepcao = gerarRecepcao; }
    public Boolean getGerarLimpeza() { return gerarLimpeza; }
    public void setGerarLimpeza(Boolean gerarLimpeza) { this.gerarLimpeza = gerarLimpeza; }
    public Boolean getAgruparPortariaRecepcao() { return agruparPortariaRecepcao; }
    public void setAgruparPortariaRecepcao(Boolean agruparPortariaRecepcao) { this.agruparPortariaRecepcao = agruparPortariaRecepcao; }
    public Boolean getLimpezaMensal() { return limpezaMensal; }
    public void setLimpezaMensal(Boolean limpezaMensal) { this.limpezaMensal = limpezaMensal; }
    public ModoLimpezaEscala getModoLimpeza() { return modoLimpeza; }
    public void setModoLimpeza(ModoLimpezaEscala modoLimpeza) { this.modoLimpeza = modoLimpeza; }
    public DiaSemanaCulto getDiaSemanaLimpeza() { return diaSemanaLimpeza; }
    public void setDiaSemanaLimpeza(DiaSemanaCulto diaSemanaLimpeza) { this.diaSemanaLimpeza = diaSemanaLimpeza; }
}
