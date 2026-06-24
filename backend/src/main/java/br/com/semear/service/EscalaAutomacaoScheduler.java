package br.com.semear.service;

import br.com.semear.domain.EscalaConfigAutomatica;
import br.com.semear.repository.EscalaConfigAutomaticaRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class EscalaAutomacaoScheduler {

    private static final Logger LOG = LoggerFactory.getLogger(EscalaAutomacaoScheduler.class);

    private final EscalaConfigAutomaticaRepository configRepository;
    private final EscalaAutomacaoService escalaAutomacaoService;

    public EscalaAutomacaoScheduler(EscalaConfigAutomaticaRepository configRepository, EscalaAutomacaoService escalaAutomacaoService) {
        this.configRepository = configRepository;
        this.escalaAutomacaoService = escalaAutomacaoService;
    }

    /** Diariamente às 06:30 — gera rascunho do próximo ciclo quando faltar antecedência configurada. */
    @Scheduled(cron = "0 30 6 * * ?")
    @Transactional
    public void executarRotinaDiaria() {
        LOG.debug("Iniciando rotina diária de escalas automáticas");
        List<EscalaConfigAutomatica> configs = configRepository.findByAtivoTrue();
        for (EscalaConfigAutomatica config : configs) {
            if (config.getIgreja() == null) {
                continue;
            }
            escalaAutomacaoService.executarRotinaAgendadaIgreja(config.getIgreja().getId());
        }
    }
}
