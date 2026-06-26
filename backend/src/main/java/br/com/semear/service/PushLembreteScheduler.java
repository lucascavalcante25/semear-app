package br.com.semear.service;

import br.com.semear.config.PushNotificationProperties;
import br.com.semear.domain.Escala;
import br.com.semear.domain.EscalaItem;
import br.com.semear.domain.Evento;
import br.com.semear.domain.Igreja;
import br.com.semear.domain.enumeration.StatusEvento;
import br.com.semear.domain.enumeration.StatusEscalaPublicacao;
import br.com.semear.repository.EscalaItemRepository;
import br.com.semear.repository.EscalaRepository;
import br.com.semear.repository.EventoRepository;
import br.com.semear.repository.IgrejaRepository;
import br.com.semear.repository.UsuarioPreferenciaNotificacaoRepository;
import br.com.semear.service.dto.NotificacaoPayloadDTO;
import br.com.semear.service.util.VersiculoDoDiaUtils;
import br.com.semear.service.util.VersiculoDoDiaUtils.Versiculo;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class PushLembreteScheduler {

    private static final Logger LOG = LoggerFactory.getLogger(PushLembreteScheduler.class);
    private static final ZoneId ZONE_BR = ZoneId.of("America/Sao_Paulo");
    private static final DateTimeFormatter HORA_FMT = DateTimeFormatter.ofPattern("HH:mm", Locale.forLanguageTag("pt-BR"));

    private final PushNotificationProperties pushProperties;
    private final NotificacaoEnvioService notificacaoEnvioService;
    private final EventoRepository eventoRepository;
    private final EscalaRepository escalaRepository;
    private final EscalaItemRepository escalaItemRepository;
    private final IgrejaRepository igrejaRepository;
    private final UsuarioPreferenciaNotificacaoRepository preferenciaRepository;

    public PushLembreteScheduler(
        PushNotificationProperties pushProperties,
        NotificacaoEnvioService notificacaoEnvioService,
        EventoRepository eventoRepository,
        EscalaRepository escalaRepository,
        EscalaItemRepository escalaItemRepository,
        IgrejaRepository igrejaRepository,
        UsuarioPreferenciaNotificacaoRepository preferenciaRepository
    ) {
        this.pushProperties = pushProperties;
        this.notificacaoEnvioService = notificacaoEnvioService;
        this.eventoRepository = eventoRepository;
        this.escalaRepository = escalaRepository;
        this.escalaItemRepository = escalaItemRepository;
        this.igrejaRepository = igrejaRepository;
        this.preferenciaRepository = preferenciaRepository;
    }

    /** Eventos de amanhã — 08:00 */
    @Scheduled(cron = "0 0 8 * * ?", zone = "America/Sao_Paulo")
    @Transactional
    public void lembreteEventosAmanha() {
        if (!pushProperties.isEnabled()) return;
        LocalDate amanha = LocalDate.now(ZONE_BR).plusDays(1);
        executarLembreteEventos(amanha, "EVENTO_LEMBRETE_AMANHA", "Evento amanhã");
    }

    /** Eventos de hoje — 08:00 */
    @Scheduled(cron = "0 0 8 * * ?", zone = "America/Sao_Paulo")
    @Transactional
    public void lembreteEventosHoje() {
        if (!pushProperties.isEnabled()) return;
        LocalDate hoje = LocalDate.now(ZONE_BR);
        executarLembreteEventos(hoje, "EVENTO_LEMBRETE_HOJE", "Evento hoje");
    }

    /** Escala semanal — domingo 18:00 */
    @Scheduled(cron = "0 0 18 * * SUN", zone = "America/Sao_Paulo")
    @Transactional
    public void lembreteEscalaSemanal() {
        if (!pushProperties.isEnabled()) return;
        LocalDate inicioSemana = LocalDate.now(ZONE_BR).with(TemporalAdjusters.next(java.time.DayOfWeek.MONDAY));
        LocalDate fimSemana = inicioSemana.plusDays(6);
        executarLembreteEscalasPeriodo(inicioSemana, fimSemana, "ESCALA_LEMBRETE_SEMANA", "Sua escala na próxima semana");
    }

    /** Escala de amanhã — 18:00 */
    @Scheduled(cron = "0 0 18 * * ?", zone = "America/Sao_Paulo")
    @Transactional
    public void lembreteEscalaAmanha() {
        if (!pushProperties.isEnabled()) return;
        LocalDate amanha = LocalDate.now(ZONE_BR).plusDays(1);
        executarLembreteEscalasPeriodo(amanha, amanha, "ESCALA_LEMBRETE_AMANHA", "Escala amanhã");
    }

    /** Devocional — 06:30 (somente quem ativou) */
    @Scheduled(cron = "0 30 6 * * ?", zone = "America/Sao_Paulo")
    @Transactional
    public void lembreteDevocional() {
        if (!pushProperties.isEnabled()) return;
        LocalDate hoje = LocalDate.now(ZONE_BR);
        for (Igreja igreja : igrejaRepository.findAll()) {
            List<br.com.semear.domain.UsuarioPreferenciaNotificacao> prefs =
                preferenciaRepository.findByIgrejaIdAndDevocionalAtivoTrueAndPushAtivoTrue(igreja.getId());
            for (var pref : prefs) {
                if (pref.getUser() == null) continue;
                NotificacaoPayloadDTO payload = new NotificacaoPayloadDTO();
                payload.setIgrejaId(igreja.getId());
                payload.setTipo("DEVOCIONAL_DIARIO");
                payload.setEntidadeTipo("DEVOCIONAL");
                payload.setTitulo("Devocional de hoje");
                payload.setMensagem("Reserve um momento para a leitura devocional de hoje.");
                payload.setRotaDestino("/devocionais");
                payload.setRegistrarDeduplicacao(true);
                payload.setChaveDeduplicacao(
                    NotificacaoEnvioService.montarChaveDeduplicacao(
                        "DEVOCIONAL_DIARIO", "DEVOCIONAL", null, pref.getUser().getId(), hoje
                    )
                );
                notificacaoEnvioService.enviarParaUsuario(pref.getUser().getId(), payload);
            }
        }
        LOG.debug("Job devocional executado para {}", hoje);
    }

    /** Versículo do dia — 14:33 (mesmo texto do dashboard). Envia para quem ativou push. */
    @Scheduled(cron = "0 33 14 * * ?", zone = "America/Sao_Paulo")
    @Transactional
    public void lembreteVersiculoDoDia() {
        if (!pushProperties.isEnabled()) {
            LOG.debug("Job versículo do dia ignorado — push desabilitado");
            return;
        }
        executarDisparoVersiculoDoDia();
    }

    /** Disparo manual (dev/teste) — mesmo fluxo do job agendado. */
    @Transactional
    public void executarDisparoVersiculoDoDia() {
        LocalDate hoje = LocalDate.now(ZONE_BR);
        Versiculo versiculo = VersiculoDoDiaUtils.obterVersiculoDoDia(hoje);
        String titulo = "Versículo do dia — " + versiculo.referencia();
        String mensagem = VersiculoDoDiaUtils.truncarTexto(versiculo.texto(), 200);

        LOG.info("Iniciando job versículo do dia ({}) — \"{}\"", hoje, versiculo.referencia());

        int totalIgrejas = 0;
        int totalUsuarios = 0;
        for (Igreja igreja : igrejaRepository.findAll()) {
            List<br.com.semear.domain.UsuarioPreferenciaNotificacao> prefs =
                preferenciaRepository.findByIgrejaIdAndPushAtivoTrue(igreja.getId());
            if (prefs.isEmpty()) {
                continue;
            }
            List<Long> usuarioIds = new ArrayList<>();
            for (var pref : prefs) {
                if (pref.getUser() != null && pref.getUser().getId() != null) {
                    usuarioIds.add(pref.getUser().getId());
                }
            }
            if (usuarioIds.isEmpty()) {
                continue;
            }

            NotificacaoPayloadDTO payload = new NotificacaoPayloadDTO();
            payload.setIgrejaId(igreja.getId());
            payload.setTipo("VERSICULO_DIA");
            payload.setEntidadeTipo("VERSICULO");
            payload.setTitulo(titulo);
            payload.setMensagem(mensagem);
            payload.setRotaDestino("/");
            payload.setRegistrarDeduplicacao(true);
            payload.setContextoDestinatarios(
                "usuários com push ativo — versículo do dia (" + usuarioIds.size() + " usuário(s))"
            );
            notificacaoEnvioService.enviarParaUsuarios(usuarioIds, payload);

            totalIgrejas++;
            totalUsuarios += usuarioIds.size();
        }

        LOG.info(
            "Job versículo do dia concluído ({}) | {} igreja(s) | {} usuário(s) elegível(eis) | referência: {}",
            hoje,
            totalIgrejas,
            totalUsuarios,
            versiculo.referencia()
        );
    }

    private void executarLembreteEventos(LocalDate data, String tipo, String tituloPrefixo) {
        Instant inicio = data.atStartOfDay(ZONE_BR).toInstant();
        Instant fim = data.plusDays(1).atStartOfDay(ZONE_BR).toInstant();
        for (Igreja igreja : igrejaRepository.findAll()) {
            List<Evento> eventos = eventoRepository.buscarComFiltros(
                igreja.getId(),
                null,
                null,
                StatusEvento.PUBLICADO,
                null,
                inicio.minusSeconds(1),
                fim
            );
            for (Evento evento : eventos) {
                if (evento.getDataInicio() == null) continue;
                String hora = HORA_FMT.format(evento.getDataInicio().atZone(ZONE_BR));
                NotificacaoPayloadDTO payload = new NotificacaoPayloadDTO();
                payload.setIgrejaId(igreja.getId());
                payload.setTipo(tipo);
                payload.setEntidadeTipo("EVENTO");
                payload.setEntidadeId(evento.getId());
                payload.setTitulo(tituloPrefixo);
                payload.setMensagem("\"" + evento.getTitulo() + "\" às " + hora + ".");
                payload.setRotaDestino("/eventos?eventoId=" + evento.getId());
                payload.setRegistrarDeduplicacao(true);
                notificacaoEnvioService.enviarParaInscritosEvento(evento.getId(), payload);
            }
        }
        LOG.debug("Job {} executado para data {}", tipo, data);
    }

    private void executarLembreteEscalasPeriodo(LocalDate inicio, LocalDate fim, String tipo, String titulo) {
        Instant instanteInicio = inicio.atStartOfDay(ZONE_BR).toInstant();
        Instant instanteFim = fim.plusDays(1).atStartOfDay(ZONE_BR).toInstant();
        for (Igreja igreja : igrejaRepository.findAll()) {
            List<Escala> escalas = escalaRepository.findByIgrejaIdAndStatusOrderByDataEventoDesc(igreja.getId(), StatusEscalaPublicacao.PUBLICADA);
            for (Escala escala : escalas) {
                if (escala.getDataEvento() == null) continue;
                Instant dataEscala = escala.getDataEvento();
                if (dataEscala.isBefore(instanteInicio) || !dataEscala.isBefore(instanteFim)) {
                    continue;
                }
                List<EscalaItem> itens = escalaItemRepository.findByEscalaId(escala.getId());
                for (EscalaItem item : itens) {
                    if (item.getUser() == null) continue;
                    NotificacaoPayloadDTO payload = new NotificacaoPayloadDTO();
                    payload.setIgrejaId(igreja.getId());
                    payload.setTipo(tipo);
                    payload.setEntidadeTipo("ESCALA");
                    payload.setEntidadeId(escala.getId());
                    payload.setTitulo(titulo);
                    payload.setMensagem("Você está escalado em \"" + escala.getTitulo() + "\".");
                    payload.setRotaDestino("/escalas");
                    payload.setRegistrarDeduplicacao(true);
                    payload.setChaveDeduplicacao(
                        NotificacaoEnvioService.montarChaveDeduplicacao(tipo, "ESCALA", escala.getId(), item.getUser().getId(), inicio)
                    );
                    notificacaoEnvioService.enviarParaUsuario(item.getUser().getId(), payload);
                }
            }
        }
        LOG.debug("Job {} executado de {} a {}", tipo, inicio, fim);
    }
}
