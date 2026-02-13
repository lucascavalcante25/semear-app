package br.com.semear.config;

import br.com.semear.domain.Devocional;
import br.com.semear.repository.DevocionalRepository;
import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
public class DevocionalDataInitializer implements CommandLineRunner {

    private final Logger log = LoggerFactory.getLogger(DevocionalDataInitializer.class);

    private final DevocionalRepository devocionalRepository;

    public DevocionalDataInitializer(DevocionalRepository devocionalRepository) {
        this.devocionalRepository = devocionalRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (devocionalRepository.count() > 0) {
            log.info("Devocionais already present, skipping seeding");
            return;
        }

        log.info("Seeding devocionais for dev profile");
        List<Devocional> list = new ArrayList<>();
        Random rnd = new Random();
        LocalDate now = LocalDate.now();
        for (int i = 0; i < 300; i++) {
            Devocional d = new Devocional();
            d.setTitulo("Devocional " + (i + 1) + " - " + randomSubtitle(rnd));
            d.setVersiculoBase(randomVersiculo(rnd));
            d.setTextoVersiculo("Texto do versículo base para devocional " + (i + 1));
            d.setConteudo("Conteúdo gerado automaticamente para devocional número " + (i + 1) + ".\n\nMensagem inspiradora e exemplo de conteúdo.");
            // distribute dates over last 6 months
            int daysBack = rnd.nextInt(180);
            d.setDataPublicacao(now.minus(Period.ofDays(daysBack)));
            list.add(d);
        }

        devocionalRepository.saveAll(list);
        log.info("Seeded {} devocionais", list.size());
    }

    private String randomSubtitle(Random rnd) {
        String[] parts = {"Esperança", "Fé", "Amor", "Perseverança", "Gratidão", "Perdão", "Sabedoria"};
        return parts[rnd.nextInt(parts.length)];
    }

    private String randomVersiculo(Random rnd) {
        String[] refs = {"João 3:16", "Salmos 23:1", "Filipenses 4:13", "Mateus 5:9", "Romanos 8:28"};
        return refs[rnd.nextInt(refs.length)];
    }
}
