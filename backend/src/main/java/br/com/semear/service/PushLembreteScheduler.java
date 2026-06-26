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
import br.com.semear.repository.UserRepository;
import br.com.semear.repository.UsuarioPreferenciaNotificacaoRepository;
import br.com.semear.domain.User;
import br.com.semear.service.dto.NotificacaoPayloadDTO;
import br.com.semear.service.util.EscalaNotificacaoUtils;
import br.com.semear.service.util.PlanoLeituraColetivoUtils;
import br.com.semear.service.util.PlanoLeituraColetivoUtils.LeituraDoDia;
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
    private final NotificacaoProgramadaService notificacaoProgramadaService;
    private final UserRepository userRepository;

    public PushLembreteScheduler(
        PushNotificationProperties pushProperties,
        NotificacaoEnvioService notificacaoEnvioService,
        EventoRepository eventoRepository,
        EscalaRepository escalaRepository,
        EscalaItemRepository escalaItemRepository,
        IgrejaRepository igrejaRepository,
        UsuarioPreferenciaNotificacaoRepository preferenciaRepository,
        NotificacaoProgramadaService notificacaoProgramadaService,
        UserRepository userRepository
    ) {
        this.pushProperties = pushProperties;
        this.notificacaoEnvioService = notificacaoEnvioService;
        this.eventoRepository = eventoRepository;
        this.escalaRepository = escalaRepository;
        this.escalaItemRepository = escalaItemRepository;
        this.igrejaRepository = igrejaRepository;
        this.preferenciaRepository = preferenciaRepository;
        this.notificacaoProgramadaService = notificacaoProgramadaService;
        this.userRepository = userRepository;
    }

    /** Lembretes configurados por evento — a cada hora (independente do flag push). */
    @Scheduled(cron = "0 0 * * * ?", zone = "America/Sao_Paulo")
    @Transactional
    public void processarNotificacoesAgendadas() {
        notificacaoProgramadaService.processarAgendamentosPendentes();
    }

    /** Parabéns personalizado no dia do aniversário — 08:30. */
    @Scheduled(cron = "0 30 8 * * ?", zone = "America/Sao_Paulo")
    @Transactional
    public void lembreteAniversarios() {
        if (!pushProperties.isEnabled()) {
            return;
        }
        LocalDate hoje = LocalDate.now(ZONE_BR);
        int enviados = 0;
        for (Igreja igreja : igrejaRepository.findAll()) {
            List<User> membros = userRepository.findAllByIgrejaIdAndBirthDateIsNotNullAndActivatedIsTrue(igreja.getId());
            for (User user : membros) {
                if (user.getBirthDate() == null) {
                    continue;
                }
                if (
                    user.getBirthDate().getMonthValue() != hoje.getMonthValue() ||
                    user.getBirthDate().getDayOfMonth() != hoje.getDayOfMonth()
                ) {
                    continue;
                }
                String nome = montarPrimeiroNome(user);
                NotificacaoPayloadDTO payload = new NotificacaoPayloadDTO();
                payload.setIgrejaId(igreja.getId());
                payload.setTipo("ANIVERSARIO");
                payload.setEntidadeTipo("USUARIO");
                payload.setEntidadeId(user.getId());
                payload.setTitulo("Feliz aniversário! 🎉");
                payload.setMensagem("Parabéns, " + nome + "! Que Deus abençoe ricamente este novo ano de vida.");
                payload.setRotaDestino("/aniversariantes");
                payload.setRegistrarDeduplicacao(true);
                notificacaoEnvioService.enviarParaUsuario(user.getId(), payload);
                enviados++;
            }
        }
        LOG.info("Job aniversários concluído ({}) | {} notificação(ões)", hoje, enviados);
    }

    private static String montarPrimeiroNome(User user) {
        if (user.getFirstName() != null && !user.getFirstName().isBlank()) {
            return user.getFirstName().trim();
        }
        return "irmão(ã)";
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

    /** Escala semanal — domingo 18:00 (somente dentro da janela de 15 dias) */
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

    /** Versículo do dia + leitura coletiva — 07:00 BRT. */
    @Scheduled(cron = "0 0 7 * * ?", zone = "America/Sao_Paulo")
    @Transactional
    public void lembreteVersiculoDoDia() {
        if (!pushProperties.isEnabled()) {
            LOG.debug("Job matinal ignorado — push desabilitado");
            return;
        }
        executarDisparoVersiculoDoDia();
        executarDisparoLeituraColetiva();
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

    /** Leitura coletiva da igreja — somente quando {@code dataInicioPlanoLeitura} está configurada e já iniciou. */
    @Transactional
    public void executarDisparoLeituraColetiva() {
        LocalDate hoje = LocalDate.now(ZONE_BR);
        int totalIgrejas = 0;
        int totalUsuarios = 0;

        for (Igreja igreja : igrejaRepository.findAll()) {
            if (igreja.getDataInicioPlanoLeitura() == null) {
                continue;
            }
            var leituraOpt = PlanoLeituraColetivoUtils.obterLeituraDoDia(igreja.getDataInicioPlanoLeitura(), hoje);
            if (leituraOpt.isEmpty()) {
                continue;
            }
            LeituraDoDia leitura = leituraOpt.get();
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

            String mensagem = PlanoLeituraColetivoUtils.formatarMensagem(leitura);
            NotificacaoPayloadDTO payload = new NotificacaoPayloadDTO();
            payload.setIgrejaId(igreja.getId());
            payload.setTipo("LEITURA_COLETIVA");
            payload.setEntidadeTipo("PLANO_LEITURA");
            payload.setTitulo("Leitura bíblica de hoje");
            payload.setMensagem(mensagem);
            payload.setRotaDestino("/");
            payload.setRegistrarDeduplicacao(true);
            payload.setContextoDestinatarios(
                "plano coletivo — dia " + leitura.numeroDia() + " (" + usuarioIds.size() + " usuário(s))"
            );
            notificacaoEnvioService.enviarParaUsuarios(usuarioIds, payload);

            totalIgrejas++;
            totalUsuarios += usuarioIds.size();
            LOG.info(
                "Leitura coletiva enviada — igreja {} | dia {} | {}",
                igreja.getId(),
                leitura.numeroDia(),
                mensagem
            );
        }

        LOG.info(
            "Job leitura coletiva concluído ({}) | {} igreja(s) | {} usuário(s)",
            hoje,
            totalIgrejas,
            totalUsuarios
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
                if (notificacaoProgramadaService.possuiConfigAtiva(evento.getConfigNotificacao())) {
                    continue;
                }
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
        LocalDate hoje = LocalDate.now(ZONE_BR);
        for (Igreja igreja : igrejaRepository.findAll()) {
            List<Escala> escalas = escalaRepository.findByIgrejaIdAndStatusOrderByDataEventoDesc(igreja.getId(), StatusEscalaPublicacao.PUBLICADA);
            for (Escala escala : escalas) {
                if (!EscalaNotificacaoUtils.escalaElegivelParaNotificacao(escala)) {
                    continue;
                }
                if (!EscalaNotificacaoUtils.escalaDentroDaJanelaLembretesPeriodicos(escala, hoje)) {
                    continue;
                }
                if (escala.getDataEvento() == null) continue;
                Instant dataEscala = escala.getDataEvento();
                if (dataEscala.isBefore(instanteInicio) || !dataEscala.isBefore(instanteFim)) {
                    continue;
                }
                List<EscalaItem> itens = escalaItemRepository.findByEscalaId(escala.getId());
                for (EscalaItem item : itens) {
                    if (item.getUser() == null || !item.getUser().isActivated()) continue;
                    NotificacaoPayloadDTO payload = new NotificacaoPayloadDTO();
                    payload.setIgrejaId(igreja.getId());
                    payload.setTipo(tipo);
                    payload.setEntidadeTipo("ESCALA");
                    payload.setEntidadeId(escala.getId());
                    payload.setTitulo(titulo);
                    payload.setMensagem(EscalaNotificacaoUtils.montarDescricao(escala));
                    payload.setRotaDestino(EscalaNotificacaoUtils.montarRota(escala, item));
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
