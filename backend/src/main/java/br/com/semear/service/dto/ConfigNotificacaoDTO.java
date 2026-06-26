package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.TipoAudienciaNotificacao;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Configuração de notificações push/in-app para eventos e comunicados.
 * Persistida como JSON nas entidades {@code Evento} e {@code Comunicado}.
 */
public class ConfigNotificacaoDTO implements Serializable {

    /** Master toggle — sem isso, nenhuma notificação configurável é enviada. */
    private Boolean ativo = false;

    /** Enviar ao publicar/criar (evento publicado ou comunicado ativo). */
    private Boolean enviarNaPublicacao = true;

    /** Enviar quando o cadastro for alterado (somente eventos). */
    private Boolean enviarNaAlteracao = false;

    private TipoAudienciaNotificacao audiencia = TipoAudienciaNotificacao.TODOS;

    /** Obrigatório quando audiencia = DEPARTAMENTOS. */
    private List<Long> departamentoIds = new ArrayList<>();

    /**
     * Quantos dias antes do evento começar a enviar lembretes (0 = no dia).
     * Usado quando {@link #lembreteDiario} = true.
     */
    private Integer diasAntesInicio = 3;

    /**
     * Dias específicos antes do evento (ex.: [7, 3, 1, 0]).
     * Usado quando {@link #lembreteDiario} = false.
     */
    private List<Integer> diasAntesEspecificos = new ArrayList<>(List.of(1, 0));

    /** Se true, envia um lembrete por dia desde {@code diasAntesInicio} até o dia do evento. */
    private Boolean lembreteDiario = true;

    /** Horário do lembrete (HH:mm, fuso America/Sao_Paulo). */
    private String horaLembrete = "08:00";

    /** Enviar quando o evento for cancelado (fallback: {@link #enviarNaAlteracao}). */
    private Boolean enviarNoCancelamento;

    /** Mensagem opcional — comunicados; se vazia, usa o conteúdo resumido. */
    private String mensagemPersonalizada;

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public Boolean getEnviarNaPublicacao() {
        return enviarNaPublicacao;
    }

    public void setEnviarNaPublicacao(Boolean enviarNaPublicacao) {
        this.enviarNaPublicacao = enviarNaPublicacao;
    }

    public Boolean getEnviarNaAlteracao() {
        return enviarNaAlteracao;
    }

    public void setEnviarNaAlteracao(Boolean enviarNaAlteracao) {
        this.enviarNaAlteracao = enviarNaAlteracao;
    }

    public Boolean getEnviarNoCancelamento() {
        return enviarNoCancelamento;
    }

    public void setEnviarNoCancelamento(Boolean enviarNoCancelamento) {
        this.enviarNoCancelamento = enviarNoCancelamento;
    }

    public TipoAudienciaNotificacao getAudiencia() {
        return audiencia;
    }

    public void setAudiencia(TipoAudienciaNotificacao audiencia) {
        this.audiencia = audiencia;
    }

    public List<Long> getDepartamentoIds() {
        return departamentoIds;
    }

    public void setDepartamentoIds(List<Long> departamentoIds) {
        this.departamentoIds = departamentoIds != null ? departamentoIds : new ArrayList<>();
    }

    public Integer getDiasAntesInicio() {
        return diasAntesInicio;
    }

    public void setDiasAntesInicio(Integer diasAntesInicio) {
        this.diasAntesInicio = diasAntesInicio;
    }

    public List<Integer> getDiasAntesEspecificos() {
        return diasAntesEspecificos;
    }

    public void setDiasAntesEspecificos(List<Integer> diasAntesEspecificos) {
        this.diasAntesEspecificos = diasAntesEspecificos != null ? diasAntesEspecificos : new ArrayList<>();
    }

    public Boolean getLembreteDiario() {
        return lembreteDiario;
    }

    public void setLembreteDiario(Boolean lembreteDiario) {
        this.lembreteDiario = lembreteDiario;
    }

    public String getHoraLembrete() {
        return horaLembrete;
    }

    public void setHoraLembrete(String horaLembrete) {
        this.horaLembrete = horaLembrete;
    }

    public String getMensagemPersonalizada() {
        return mensagemPersonalizada;
    }

    public void setMensagemPersonalizada(String mensagemPersonalizada) {
        this.mensagemPersonalizada = mensagemPersonalizada;
    }

    public boolean isEfetivamenteAtivo() {
        return Boolean.TRUE.equals(ativo);
    }
}
