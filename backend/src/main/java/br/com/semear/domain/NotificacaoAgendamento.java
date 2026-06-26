package br.com.semear.domain;

import br.com.semear.domain.enumeration.StatusNotificacaoAgendamento;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "notificacao_agendamento")
public class NotificacaoAgendamento implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @Column(name = "igreja_id", nullable = false)
    private Long igrejaId;

    @NotNull
    @Column(name = "entidade_tipo", nullable = false, length = 30)
    private String entidadeTipo;

    @NotNull
    @Column(name = "entidade_id", nullable = false)
    private Long entidadeId;

    @NotNull
    @Column(name = "tipo_notificacao", nullable = false, length = 30)
    private String tipoNotificacao;

    @NotNull
    @Column(name = "agendado_para", nullable = false)
    private Instant agendadoPara;

    @NotNull
    @Column(name = "titulo", nullable = false, length = 200)
    private String titulo;

    @Column(name = "mensagem", columnDefinition = "text")
    private String mensagem;

    @Column(name = "rota_destino", length = 255)
    private String rotaDestino;

    @Column(name = "config_json", columnDefinition = "text")
    private String configJson;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StatusNotificacaoAgendamento status = StatusNotificacaoAgendamento.PENDENTE;

    @NotNull
    @Column(name = "chave_unica", nullable = false, unique = true, length = 200)
    private String chaveUnica;

    @NotNull
    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm = Instant.now();

    @Column(name = "enviado_em")
    private Instant enviadoEm;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIgrejaId() {
        return igrejaId;
    }

    public void setIgrejaId(Long igrejaId) {
        this.igrejaId = igrejaId;
    }

    public String getEntidadeTipo() {
        return entidadeTipo;
    }

    public void setEntidadeTipo(String entidadeTipo) {
        this.entidadeTipo = entidadeTipo;
    }

    public Long getEntidadeId() {
        return entidadeId;
    }

    public void setEntidadeId(Long entidadeId) {
        this.entidadeId = entidadeId;
    }

    public String getTipoNotificacao() {
        return tipoNotificacao;
    }

    public void setTipoNotificacao(String tipoNotificacao) {
        this.tipoNotificacao = tipoNotificacao;
    }

    public Instant getAgendadoPara() {
        return agendadoPara;
    }

    public void setAgendadoPara(Instant agendadoPara) {
        this.agendadoPara = agendadoPara;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }

    public String getRotaDestino() {
        return rotaDestino;
    }

    public void setRotaDestino(String rotaDestino) {
        this.rotaDestino = rotaDestino;
    }

    public String getConfigJson() {
        return configJson;
    }

    public void setConfigJson(String configJson) {
        this.configJson = configJson;
    }

    public StatusNotificacaoAgendamento getStatus() {
        return status;
    }

    public void setStatus(StatusNotificacaoAgendamento status) {
        this.status = status;
    }

    public String getChaveUnica() {
        return chaveUnica;
    }

    public void setChaveUnica(String chaveUnica) {
        this.chaveUnica = chaveUnica;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(Instant criadoEm) {
        this.criadoEm = criadoEm;
    }

    public Instant getEnviadoEm() {
        return enviadoEm;
    }

    public void setEnviadoEm(Instant enviadoEm) {
        this.enviadoEm = enviadoEm;
    }
}
