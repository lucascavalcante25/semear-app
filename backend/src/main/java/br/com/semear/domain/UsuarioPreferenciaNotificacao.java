package br.com.semear.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalTime;

@Entity
@Table(
    name = "usuario_preferencia_notificacao",
    uniqueConstraints = @UniqueConstraint(name = "uk_pref_notif_user_igreja", columnNames = { "user_id", "igreja_id" })
)
public class UsuarioPreferenciaNotificacao implements Serializable {

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
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties(value = { "hibernateLazyInitializer", "handler", "password", "authorities" }, allowSetters = true)
    private User user;

    @NotNull
    @Column(name = "push_ativo", nullable = false)
    private Boolean pushAtivo = false;

    @NotNull
    @Column(name = "eventos_ativo", nullable = false)
    private Boolean eventosAtivo = true;

    @NotNull
    @Column(name = "escalas_ativo", nullable = false)
    private Boolean escalasAtivo = true;

    @NotNull
    @Column(name = "devocional_ativo", nullable = false)
    private Boolean devocionalAtivo = false;

    @NotNull
    @Column(name = "avisos_gerais_ativo", nullable = false)
    private Boolean avisosGeraisAtivo = true;

    @NotNull
    @Column(name = "departamentos_ativo", nullable = false)
    private Boolean departamentosAtivo = true;

    @NotNull
    @Column(name = "cultos_ativo", nullable = false)
    private Boolean cultosAtivo = true;

    @Column(name = "horario_silencioso_inicio")
    private LocalTime horarioSilenciosoInicio;

    @Column(name = "horario_silencioso_fim")
    private LocalTime horarioSilenciosoFim;

    @NotNull
    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm = Instant.now();

    @NotNull
    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Igreja getIgreja() { return igreja; }
    public void setIgreja(Igreja igreja) { this.igreja = igreja; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Boolean getPushAtivo() { return pushAtivo; }
    public void setPushAtivo(Boolean pushAtivo) { this.pushAtivo = pushAtivo; }
    public Boolean getEventosAtivo() { return eventosAtivo; }
    public void setEventosAtivo(Boolean eventosAtivo) { this.eventosAtivo = eventosAtivo; }
    public Boolean getEscalasAtivo() { return escalasAtivo; }
    public void setEscalasAtivo(Boolean escalasAtivo) { this.escalasAtivo = escalasAtivo; }
    public Boolean getDevocionalAtivo() { return devocionalAtivo; }
    public void setDevocionalAtivo(Boolean devocionalAtivo) { this.devocionalAtivo = devocionalAtivo; }
    public Boolean getAvisosGeraisAtivo() { return avisosGeraisAtivo; }
    public void setAvisosGeraisAtivo(Boolean avisosGeraisAtivo) { this.avisosGeraisAtivo = avisosGeraisAtivo; }
    public Boolean getDepartamentosAtivo() { return departamentosAtivo; }
    public void setDepartamentosAtivo(Boolean departamentosAtivo) { this.departamentosAtivo = departamentosAtivo; }
    public Boolean getCultosAtivo() { return cultosAtivo; }
    public void setCultosAtivo(Boolean cultosAtivo) { this.cultosAtivo = cultosAtivo; }
    public LocalTime getHorarioSilenciosoInicio() { return horarioSilenciosoInicio; }
    public void setHorarioSilenciosoInicio(LocalTime horarioSilenciosoInicio) { this.horarioSilenciosoInicio = horarioSilenciosoInicio; }
    public LocalTime getHorarioSilenciosoFim() { return horarioSilenciosoFim; }
    public void setHorarioSilenciosoFim(LocalTime horarioSilenciosoFim) { this.horarioSilenciosoFim = horarioSilenciosoFim; }
    public Instant getCriadoEm() { return criadoEm; }
    public void setCriadoEm(Instant criadoEm) { this.criadoEm = criadoEm; }
    public Instant getAtualizadoEm() { return atualizadoEm; }
    public void setAtualizadoEm(Instant atualizadoEm) { this.atualizadoEm = atualizadoEm; }
}
