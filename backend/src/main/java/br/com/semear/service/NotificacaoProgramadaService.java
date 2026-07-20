package br.com.semear.service;

import br.com.semear.domain.Comunicado;
import br.com.semear.domain.Evento;
import br.com.semear.domain.NotificacaoAgendamento;
import br.com.semear.domain.User;
import br.com.semear.domain.enumeration.StatusEvento;
import br.com.semear.domain.enumeration.StatusNotificacaoAgendamento;
import br.com.semear.repository.EventoRepository;
import br.com.semear.repository.NotificacaoAgendamentoRepository;
import br.com.semear.service.dto.ConfigNotificacaoDTO;
import br.com.semear.service.dto.NotificacaoPayloadDTO;
import br.com.semear.service.util.ConfigNotificacaoJsonUtil;
import br.com.semear.service.util.EventoLembreteMensagens;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NotificacaoProgramadaService {

    private static final Logger LOG = LoggerFactory.getLogger(NotificacaoProgramadaService.class);
    private static final ZoneId ZONE_BR = ZoneId.of("America/Sao_Paulo");
    private static final DateTimeFormatter HORA_FMT = DateTimeFormatter.ofPattern("HH:mm", Locale.forLanguageTag("pt-BR"));
    private static final DateTimeFormatter DATA_HORA_FMT = DateTimeFormatter.ofPattern(
        "dd/MM 'às' HH:mm",
        Locale.forLanguageTag("pt-BR")
    );

    private final NotificacaoAgendamentoRepository agendamentoRepository;
    private final NotificacaoAudienciaService audienciaService;
    private final NotificacaoEnvioService envioService;
    private final EventoRepository eventoRepository;

    public NotificacaoProgramadaService(
        NotificacaoAgendamentoRepository agendamentoRepository,
        NotificacaoAudienciaService audienciaService,
        NotificacaoEnvioService envioService,
        EventoRepository eventoRepository
    ) {
        this.agendamentoRepository = agendamentoRepository;
        this.audienciaService = audienciaService;
        this.envioService = envioService;
        this.eventoRepository = eventoRepository;
    }

    public ConfigNotificacaoDTO lerConfig(String json) {
        return ConfigNotificacaoJsonUtil.parse(json);
    }

    public void sincronizarEvento(Evento evento, ConfigNotificacaoDTO config, boolean enviarPublicacaoAgora) {
        if (evento == null || evento.getId() == null) {
            return;
        }
        cancelarPendentes("EVENTO", evento.getId());
        if (config == null || !config.isEfetivamenteAtivo()) {
            return;
        }
        validarConfig(config);

        if (
            enviarPublicacaoAgora &&
            Boolean.TRUE.equals(config.getEnviarNaPublicacao()) &&
            evento.getStatus() == StatusEvento.PUBLICADO
        ) {
            enviarImediatoEvento(evento, config, "EVENTO_PUBLICACAO", "Novo evento", montarMensagemPublicacaoEvento(evento));
        }

        if (evento.getDataInicio() == null || evento.getStatus() != StatusEvento.PUBLICADO) {
            return;
        }

        agendarLembretesEvento(evento, config);
    }

    public void notificarAlteracaoEvento(Evento evento, ConfigNotificacaoDTO config, String detalhe) {
        if (evento == null || config == null || !config.isEfetivamenteAtivo() || !Boolean.TRUE.equals(config.getEnviarNaAlteracao())) {
            return;
        }
        String mensagem = "O evento \"" + evento.getTitulo() + "\" foi atualizado: " + detalhe;
        enviarImediatoEvento(evento, config, "EVENTO_ALTERACAO", "Evento atualizado", mensagem);
    }

    public void notificarCancelamentoEvento(Evento evento, ConfigNotificacaoDTO config) {
        if (evento == null || config == null || !config.isEfetivamenteAtivo()) {
            return;
        }
        boolean avisar =
            config.getEnviarNoCancelamento() != null
                ? Boolean.TRUE.equals(config.getEnviarNoCancelamento())
                : Boolean.TRUE.equals(config.getEnviarNaAlteracao());
        if (!avisar) {
            return;
        }
        enviarImediatoEvento(
            evento,
            config,
            "EVENTO_CANCELAMENTO",
            "Evento cancelado",
            "O evento \"" + evento.getTitulo() + "\" foi cancelado."
        );
    }

    public void notificarExclusaoEvento(Evento evento, ConfigNotificacaoDTO config) {
        if (evento == null || config == null || !config.isEfetivamenteAtivo()) {
            return;
        }
        boolean avisar =
            config.getEnviarNoCancelamento() != null
                ? Boolean.TRUE.equals(config.getEnviarNoCancelamento())
                : Boolean.TRUE.equals(config.getEnviarNaAlteracao());
        if (!avisar) {
            return;
        }
        enviarImediatoEvento(
            evento,
            config,
            "EVENTO_CANCELAMENTO",
            "Evento excluído",
            "O evento \"" + evento.getTitulo() + "\" foi removido da programação."
        );
    }

    public void sincronizarComunicado(Comunicado comunicado, ConfigNotificacaoDTO config, boolean enviarPublicacaoAgora) {
        if (comunicado == null || comunicado.getId() == null) {
            return;
        }
        cancelarPendentes("COMUNICADO", comunicado.getId());
        if (config == null || !config.isEfetivamenteAtivo()) {
            return;
        }
        validarConfig(config);

        if (enviarPublicacaoAgora && Boolean.TRUE.equals(config.getEnviarNaPublicacao()) && Boolean.TRUE.equals(comunicado.getAtivo())) {
            enviarImediatoComunicado(comunicado, config);
        }
    }

    public void cancelarEntidade(String entidadeTipo, Long entidadeId) {
        cancelarPendentes(entidadeTipo, entidadeId);
    }

    /** Processa lembretes cujo horário já passou (job horário). */
    public void processarAgendamentosPendentes() {
        Instant agora = Instant.now();
        List<NotificacaoAgendamento> pendentes = agendamentoRepository.findByStatusAndAgendadoParaLessThanEqual(
            StatusNotificacaoAgendamento.PENDENTE,
            agora
        );
        for (NotificacaoAgendamento ag : pendentes) {
            try {
                ConfigNotificacaoDTO config = ConfigNotificacaoJsonUtil.parse(ag.getConfigJson());
                List<User> destinatarios = audienciaService.resolverDestinatarios(
                    ag.getIgrejaId(),
                    config,
                    "EVENTO".equals(ag.getEntidadeTipo()) ? ag.getEntidadeId() : null
                );
                if (destinatarios.isEmpty()) {
                    ag.setStatus(StatusNotificacaoAgendamento.CANCELADO);
                    agendamentoRepository.save(ag);
                    continue;
                }

                String titulo = ag.getTitulo();
                String mensagem = ag.getMensagem();
                if (
                    "EVENTO".equals(ag.getEntidadeTipo()) &&
                    ag.getEntidadeId() != null &&
                    EventoLembreteMensagens.ehTipoLembreteEvento(ag.getTipoNotificacao())
                ) {
                    var eventoOpt = eventoRepository.findById(ag.getEntidadeId());
                    if (eventoOpt.isPresent()) {
                        EventoLembreteMensagens.TextoLembrete texto = EventoLembreteMensagens.montar(eventoOpt.get());
                        titulo = texto.titulo();
                        mensagem = texto.mensagem();
                    }
                }

                NotificacaoPayloadDTO payload = new NotificacaoPayloadDTO();
                payload.setIgrejaId(ag.getIgrejaId());
                payload.setTipo(ag.getTipoNotificacao());
                payload.setEntidadeTipo(ag.getEntidadeTipo());
                payload.setEntidadeId(ag.getEntidadeId());
                payload.setTitulo(titulo);
                payload.setMensagem(mensagem);
                payload.setRotaDestino(ag.getRotaDestino());
                payload.setRegistrarDeduplicacao(true);
                payload.setContextoDestinatarios("agendamento " + ag.getChaveUnica());

                envioService.enviarParaUsuariosResolvidosPublico(destinatarios, payload);

                ag.setStatus(StatusNotificacaoAgendamento.ENVIADO);
                ag.setEnviadoEm(Instant.now());
                agendamentoRepository.save(ag);
            } catch (Exception e) {
                LOG.warn("Falha ao processar agendamento {}: {}", ag.getId(), e.getMessage());
            }
        }
    }

    public boolean possuiConfigAtiva(String configJson) {
        return lerConfig(configJson).isEfetivamenteAtivo();
    }

    private void enviarImediatoEvento(Evento evento, ConfigNotificacaoDTO config, String tipo, String titulo, String mensagem) {
        List<User> destinatarios = audienciaService.resolverDestinatarios(
            evento.getIgreja().getId(),
            config,
            evento.getId()
        );
        disparar(evento.getIgreja().getId(), "EVENTO", evento.getId(), tipo, titulo, mensagem, linkEvento(evento), destinatarios);
    }

    private void enviarImediatoComunicado(Comunicado comunicado, ConfigNotificacaoDTO config) {
        List<User> destinatarios = audienciaService.resolverDestinatarios(
            comunicado.getIgreja().getId(),
            config,
            null
        );
        String mensagem = config.getMensagemPersonalizada();
        if (mensagem == null || mensagem.isBlank()) {
            mensagem = truncar(comunicado.getConteudo(), 200);
        }
        disparar(
            comunicado.getIgreja().getId(),
            "COMUNICADO",
            comunicado.getId(),
            "COMUNICADO_PUBLICACAO",
            comunicado.getTitulo(),
            mensagem,
            "/comunicados",
            destinatarios
        );
    }

    private void disparar(
        Long igrejaId,
        String entidadeTipo,
        Long entidadeId,
        String tipo,
        String titulo,
        String mensagem,
        String rota,
        List<User> destinatarios
    ) {
        if (destinatarios.isEmpty()) {
            return;
        }
        NotificacaoPayloadDTO payload = new NotificacaoPayloadDTO();
        payload.setIgrejaId(igrejaId);
        payload.setTipo(tipo);
        payload.setEntidadeTipo(entidadeTipo);
        payload.setEntidadeId(entidadeId);
        payload.setTitulo(titulo);
        payload.setMensagem(mensagem);
        payload.setRotaDestino(rota);
        payload.setRegistrarDeduplicacao(true);
        envioService.enviarParaUsuariosResolvidosPublico(destinatarios, payload);
    }

    private void agendarLembretesEvento(Evento evento, ConfigNotificacaoDTO config) {
        LocalDate dataEvento = evento.getDataInicio().atZone(ZONE_BR).toLocalDate();
        LocalTime hora = parseHora(config.getHoraLembrete());
        Set<Integer> dias = calcularDiasLembrete(config);

        for (Integer diasAntes : dias) {
            LocalDate dataLembrete = dataEvento.minusDays(diasAntes);
            Instant agendadoPara = dataLembrete.atTime(hora).atZone(ZONE_BR).toInstant();
            if (!agendadoPara.isAfter(Instant.now())) {
                continue;
            }

            String titulo = diasAntes == 0 ? "Evento hoje" : diasAntes == 1 ? "Evento amanhã" : "Lembrete de evento";
            EventoLembreteMensagens.TextoLembrete texto = EventoLembreteMensagens.montar(evento);
            String mensagem = texto.mensagem();
            if (diasAntes == 0) {
                titulo = "Evento hoje";
            } else if (diasAntes == 1) {
                titulo = "Evento amanhã";
            } else {
                titulo = texto.titulo();
            }
            String chave = String.format(
                "AGEND:EVENTO:%s:LEMBRETE:%s:%s",
                evento.getId(),
                diasAntes,
                dataLembrete
            );

            NotificacaoAgendamento ag = new NotificacaoAgendamento();
            ag.setIgrejaId(evento.getIgreja().getId());
            ag.setEntidadeTipo("EVENTO");
            ag.setEntidadeId(evento.getId());
            ag.setTipoNotificacao("EVENTO_LEMBRETE");
            ag.setAgendadoPara(agendadoPara);
            ag.setTitulo(titulo);
            ag.setMensagem(mensagem);
            ag.setRotaDestino(linkEvento(evento));
            ag.setConfigJson(ConfigNotificacaoJsonUtil.serializar(config));
            ag.setStatus(StatusNotificacaoAgendamento.PENDENTE);
            ag.setChaveUnica(chave);
            agendamentoRepository.save(ag);
        }
    }

    private Set<Integer> calcularDiasLembrete(ConfigNotificacaoDTO config) {
        Set<Integer> dias = new HashSet<>();
        if (Boolean.TRUE.equals(config.getLembreteDiario())) {
            int inicio = config.getDiasAntesInicio() != null ? Math.max(0, config.getDiasAntesInicio()) : 3;
            for (int d = inicio; d >= 0; d--) {
                dias.add(d);
            }
        } else if (config.getDiasAntesEspecificos() != null && !config.getDiasAntesEspecificos().isEmpty()) {
            dias.addAll(config.getDiasAntesEspecificos());
        } else {
            dias.add(1);
            dias.add(0);
        }
        return dias;
    }

    private void cancelarPendentes(String entidadeTipo, Long entidadeId) {
        // Remove agendamentos da entidade para liberar chave_unica (unique).
        // Soft-cancel mantinha a chave e o próximo save quebrava com 500.
        List<NotificacaoAgendamento> existentes = agendamentoRepository.findByEntidadeTipoAndEntidadeId(
            entidadeTipo,
            entidadeId
        );
        if (existentes.isEmpty()) {
            return;
        }
        agendamentoRepository.deleteAllInBatch(existentes);
        agendamentoRepository.flush();
    }

    private void validarConfig(ConfigNotificacaoDTO config) {
        if (
            config.getAudiencia() == br.com.semear.domain.enumeration.TipoAudienciaNotificacao.DEPARTAMENTOS &&
            (config.getDepartamentoIds() == null || config.getDepartamentoIds().isEmpty())
        ) {
            throw new BadRequestAlertException(
                "Selecione ao menos um departamento para a audiência.",
                "notificacao",
                "departamentosobrigatorios"
            );
        }
    }

    private LocalTime parseHora(String hora) {
        if (hora == null || hora.isBlank()) {
            return LocalTime.of(8, 0);
        }
        try {
            String[] partes = hora.trim().split(":");
            return LocalTime.of(Integer.parseInt(partes[0]), partes.length > 1 ? Integer.parseInt(partes[1]) : 0);
        } catch (Exception e) {
            return LocalTime.of(8, 0);
        }
    }

    private String montarMensagemPublicacaoEvento(Evento evento) {
        String quando = evento.getDataInicio() != null
            ? DATA_HORA_FMT.format(evento.getDataInicio().atZone(ZONE_BR))
            : "em breve";
        String local = evento.getLocal() != null && !evento.getLocal().isBlank() ? " — " + evento.getLocal() : "";
        return "\"" + evento.getTitulo() + "\" em " + quando + local + ".";
    }

    private String linkEvento(Evento evento) {
        return evento.getId() != null ? "/eventos?eventoId=" + evento.getId() : "/eventos";
    }

    private String truncar(String texto, int max) {
        if (texto == null) return "";
        if (texto.length() <= max) return texto;
        return texto.substring(0, max - 1).trim() + "…";
    }
}
