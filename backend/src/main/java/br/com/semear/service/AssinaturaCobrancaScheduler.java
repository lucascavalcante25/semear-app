package br.com.semear.service;

import br.com.semear.domain.AssinaturaIgreja;
import br.com.semear.domain.PagamentoPlataforma;
import br.com.semear.domain.enumeration.StatusAssinatura;
import br.com.semear.domain.enumeration.StatusPagamentoPlataforma;
import br.com.semear.repository.AssinaturaIgrejaRepository;
import br.com.semear.repository.PagamentoPlataformaRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Rotinas automáticas de cobrança da plataforma (sem gateway — apenas status manual).
 */
@Service
public class AssinaturaCobrancaScheduler {

    private static final Logger LOG = LoggerFactory.getLogger(AssinaturaCobrancaScheduler.class);

    private final AssinaturaIgrejaRepository assinaturaIgrejaRepository;
    private final PagamentoPlataformaRepository pagamentoPlataformaRepository;
    private final AssinaturaIgrejaService assinaturaIgrejaService;
    private final NotificacaoService notificacaoService;

    public AssinaturaCobrancaScheduler(
        AssinaturaIgrejaRepository assinaturaIgrejaRepository,
        PagamentoPlataformaRepository pagamentoPlataformaRepository,
        AssinaturaIgrejaService assinaturaIgrejaService,
        NotificacaoService notificacaoService
    ) {
        this.assinaturaIgrejaRepository = assinaturaIgrejaRepository;
        this.pagamentoPlataformaRepository = pagamentoPlataformaRepository;
        this.assinaturaIgrejaService = assinaturaIgrejaService;
        this.notificacaoService = notificacaoService;
    }

    /** Diariamente às 06:00 — sincroniza testes vencidos e marca cobranças atrasadas. */
    @Scheduled(cron = "0 0 6 * * ?")
    @Transactional
    public void executarRotinaDiaria() {
        LOG.debug("Iniciando rotina diária de cobrança da plataforma");
        assinaturaIgrejaService.sincronizarVencimentos();
        marcarMensalidadesAtrasadas();
        marcarPagamentosAtrasados();
    }

    private void marcarMensalidadesAtrasadas() {
        LocalDate hoje = LocalDate.now();
        List<AssinaturaIgreja> candidatas = assinaturaIgrejaRepository.findByStatusAssinaturaAndStatusMensalidadeAndProximoVencimentoBefore(
            StatusAssinatura.ATIVA,
            StatusPagamentoPlataforma.PENDENTE,
            hoje
        );
        for (AssinaturaIgreja a : candidatas) {
            a.setStatusMensalidade(StatusPagamentoPlataforma.ATRASADO);
            a.setStatusPagamento(StatusPagamentoPlataforma.ATRASADO);
            a.setStatusAssinatura(StatusAssinatura.ATRASADA);
            a.setDataAtualizacao(Instant.now());
            assinaturaIgrejaRepository.save(a);
            if (a.getIgreja() != null) {
                notificacaoService.notificarMensalidadeAtrasada(a.getIgreja());
            }
            LOG.info("Mensalidade marcada como ATRASADA — igreja id={}", a.getIgreja() != null ? a.getIgreja().getId() : "?");
        }
    }

    private void marcarPagamentosAtrasados() {
        LocalDate hoje = LocalDate.now();
        List<PagamentoPlataforma> pendentes = pagamentoPlataformaRepository.findByStatusAndDataVencimentoBefore(
            StatusPagamentoPlataforma.PENDENTE,
            hoje
        );
        for (PagamentoPlataforma p : pendentes) {
            p.setStatus(StatusPagamentoPlataforma.ATRASADO);
            p.setDataAtualizacao(Instant.now());
            pagamentoPlataformaRepository.save(p);
            if (p.getIgreja() != null) {
                notificacaoService.notificarPagamentoAtrasado(p.getIgreja());
            }
        }
    }
}
