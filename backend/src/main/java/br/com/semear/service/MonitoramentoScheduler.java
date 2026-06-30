package br.com.semear.service;

import br.com.semear.domain.MonitoramentoSnapshot;
import br.com.semear.repository.MonitoramentoSnapshotRepository;
import br.com.semear.service.dto.AdminMonitoramentoDTO;
import br.com.semear.service.dto.MonitoramentoSnapshotDTO;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class MonitoramentoScheduler {

    private static final Logger LOG = LoggerFactory.getLogger(MonitoramentoScheduler.class);

    private final AdminMonitoramentoService monitoramentoService;
    private final MonitoramentoAlertaService alertaService;
    private final MonitoramentoSnapshotRepository snapshotRepository;

    @Value("${semear.monitoramento.historico-retencao-dias:7}")
    private int retencaoDias;

    public MonitoramentoScheduler(
        AdminMonitoramentoService monitoramentoService,
        MonitoramentoAlertaService alertaService,
        MonitoramentoSnapshotRepository snapshotRepository
    ) {
        this.monitoramentoService = monitoramentoService;
        this.alertaService = alertaService;
        this.snapshotRepository = snapshotRepository;
    }

    @Scheduled(fixedRateString = "${semear.monitoramento.intervalo-coleta-ms:300000}")
    @Transactional
    public void coletarPeriodicamente() {
        try {
            AdminMonitoramentoDTO dados = monitoramentoService.coletar();
            monitoramentoService.salvarSnapshot(dados);
            alertaService.verificarEAlertar(dados);
            limparAntigos();
        } catch (Exception e) {
            LOG.warn("Falha na coleta periódica de monitoramento", e);
        }
    }

    private void limparAntigos() {
        Instant limite = Instant.now().minus(retencaoDias, ChronoUnit.DAYS);
        int removidos = snapshotRepository.deleteByColetadoEmBefore(limite);
        if (removidos > 0) {
            LOG.debug("Removidos {} snapshots de monitoramento antigos", removidos);
        }
    }
}
