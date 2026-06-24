package br.com.semear.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Dispara o seed de dados mock apenas no perfil {@code dev}.
 * Os dados ficam no banco local — não são commitados nem executados em produção.
 */
@Component
@Profile("dev")
@Order(Integer.MAX_VALUE)
public class DevOperationalDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DevOperationalDataInitializer.class);

    private final DevSeedService devSeedService;

    public DevOperationalDataInitializer(DevSeedService devSeedService) {
        this.devSeedService = devSeedService;
    }

    @Override
    public void run(String... args) {
        try {
            devSeedService.executarSeNecessario();
        } catch (Exception e) {
            log.error("Falha ao executar seed de dados dev: {}", e.getMessage(), e);
        }
        try {
            devSeedService.garantirAutomacaoEscalasTodasIgrejas();
        } catch (Exception e) {
            log.error("Falha ao garantir cultos de automação de escalas: {}", e.getMessage(), e);
        }
    }
}
