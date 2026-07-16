package br.com.semear.service;

import br.com.semear.domain.Evento;
import br.com.semear.domain.EventoInscricao;
import br.com.semear.domain.enumeration.StatusEvento;
import br.com.semear.domain.enumeration.StatusInscricaoEvento;
import br.com.semear.repository.EventoInscricaoRepository;
import br.com.semear.repository.EventoRepository;
import br.com.semear.service.dto.ConfigNotificacaoDTO;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Pós-processamento de evento fora da requisição HTTP (push + agendamentos).
 * Evita que o Salvar fique bloqueado 20–30s enviando push para toda a igreja.
 */
@Service
public class EventoNotificacaoAsyncService {

    private static final Logger LOG = LoggerFactory.getLogger(EventoNotificacaoAsyncService.class);

    private final EventoRepository eventoRepository;
    private final EventoInscricaoRepository eventoInscricaoRepository;
    private final NotificacaoProgramadaService notificacaoProgramadaService;
    private final EventoNotificacaoService eventoNotificacaoService;

    public EventoNotificacaoAsyncService(
        EventoRepository eventoRepository,
        EventoInscricaoRepository eventoInscricaoRepository,
        NotificacaoProgramadaService notificacaoProgramadaService,
        EventoNotificacaoService eventoNotificacaoService
    ) {
        this.eventoRepository = eventoRepository;
        this.eventoInscricaoRepository = eventoInscricaoRepository;
        this.notificacaoProgramadaService = notificacaoProgramadaService;
        this.eventoNotificacaoService = eventoNotificacaoService;
    }

    @Async
    @Transactional
    public void processarAposCriar(Long eventoId, ConfigNotificacaoDTO config) {
        Evento evento = eventoRepository.findByIdWithIgreja(eventoId).orElse(null);
        if (evento == null) {
            return;
        }
        try {
            notificacaoProgramadaService.sincronizarEvento(evento, config, true);
        } catch (Exception e) {
            LOG.warn("Falha ao sincronizar notificações do evento {} (criar): {}", eventoId, e.getMessage());
        }
    }

    @Async
    @Transactional
    public void processarAposAtualizar(
        Long eventoId,
        String tituloAntes,
        Instant dataInicioAntes,
        Instant dataFimAntes,
        String localAntes,
        StatusEvento statusAntes,
        ConfigNotificacaoDTO config
    ) {
        Evento evento = eventoRepository.findByIdWithIgreja(eventoId).orElse(null);
        if (evento == null) {
            return;
        }
        try {
            notificarAlteracoesImportantes(tituloAntes, dataInicioAntes, dataFimAntes, localAntes, statusAntes, evento);
        } catch (Exception e) {
            LOG.warn("Falha ao notificar alterações do evento {}: {}", eventoId, e.getMessage());
        }
        try {
            notificacaoProgramadaService.sincronizarEvento(evento, config, false);
        } catch (Exception e) {
            LOG.warn("Falha ao sincronizar notificações do evento {} (atualizar): {}", eventoId, e.getMessage());
        }
    }

    private void notificarAlteracoesImportantes(
        String tituloAntes,
        Instant dataInicioAntes,
        Instant dataFimAntes,
        String localAntes,
        StatusEvento statusAntes,
        Evento depois
    ) {
        List<String> alteracoes = new ArrayList<>();
        if (!Objects.equals(tituloAntes, depois.getTitulo())) {
            alteracoes.add("título");
        }
        if (!mesmoMinuto(dataInicioAntes, depois.getDataInicio()) || !mesmoMinuto(dataFimAntes, depois.getDataFim())) {
            alteracoes.add("data/horário");
        }
        if (!Objects.equals(localAntes, depois.getLocal())) {
            alteracoes.add("local");
        }
        if (!Objects.equals(statusAntes, depois.getStatus())) {
            alteracoes.add("status");
        }
        if (alteracoes.isEmpty()) {
            return;
        }

        String detalhe = alteracoes.stream().collect(Collectors.joining(", "));
        ConfigNotificacaoDTO config = notificacaoProgramadaService.lerConfig(depois.getConfigNotificacao());
        if (config.isEfetivamenteAtivo() && Boolean.TRUE.equals(config.getEnviarNaAlteracao())) {
            if (depois.getStatus() == StatusEvento.CANCELADO) {
                notificacaoProgramadaService.notificarCancelamentoEvento(depois, config);
            } else {
                notificacaoProgramadaService.notificarAlteracaoEvento(depois, config, detalhe);
            }
            return;
        }

        List<EventoInscricao> inscritos = eventoInscricaoRepository.findByEventoIdAndStatus(
            depois.getId(),
            StatusInscricaoEvento.ATIVA
        );
        for (EventoInscricao inscricao : inscritos) {
            if (inscricao.getUser() == null) {
                continue;
            }
            if (depois.getStatus() == StatusEvento.CANCELADO) {
                eventoNotificacaoService.notificarCancelamentoEvento(depois, inscricao.getUser());
            } else {
                eventoNotificacaoService.notificarAlteracaoEvento(depois, inscricao.getUser(), detalhe);
            }
        }
    }

    /** Evita falso positivo por diferença de segundos/ms no round-trip de data/hora. */
    private static boolean mesmoMinuto(Instant a, Instant b) {
        if (a == null && b == null) {
            return true;
        }
        if (a == null || b == null) {
            return false;
        }
        return a.truncatedTo(ChronoUnit.MINUTES).equals(b.truncatedTo(ChronoUnit.MINUTES));
    }
}
