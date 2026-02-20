package br.com.semear.config;

import br.com.semear.domain.Devocional;
import br.com.semear.repository.DevocionalRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Seed de devocionais: 1 por dia.
 * - 20 dias passados (ontem até 20 dias atrás)
 * - Hoje
 * - Restante do ano (amanhã até 31/12)
 */
@Component
@Profile("dev")
public class DevocionalDataInitializer implements CommandLineRunner {

    private static final int DEVOCIONAIS_PASSADOS = 20;

    private final Logger log = LoggerFactory.getLogger(DevocionalDataInitializer.class);

    private final DevocionalRepository devocionalRepository;

    public DevocionalDataInitializer(DevocionalRepository devocionalRepository) {
        this.devocionalRepository = devocionalRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        long count = devocionalRepository.count();
        if (count > 0) {
            log.info("Devocionais already present ({}), clearing and reseeding with real verse texts", count);
            devocionalRepository.deleteAll();
        }

        log.info("Seeding devocionais for dev profile (1 per day, real verse texts)");
        List<Devocional> list = new ArrayList<>();
        Random rnd = new Random();
        LocalDate hoje = LocalDate.now();
        LocalDate fimDoAno = LocalDate.of(hoje.getYear(), 12, 31);

        int index = 0;

        // 20 devocionais passados (ontem até 20 dias atrás)
        for (int i = 1; i <= DEVOCIONAIS_PASSADOS; i++) {
            LocalDate data = hoje.minusDays(i);
            String[] vers = randomVersiculo(rnd);
            list.add(criarDevocional(++index, data, randomSubtitle(rnd), vers[0], vers[1], rnd));
        }

        // Devocional de hoje
        String[] versHoje = randomVersiculo(rnd);
        list.add(criarDevocional(++index, hoje, randomSubtitle(rnd), versHoje[0], versHoje[1], rnd));

        // Devocionais do restante do ano (amanhã até 31/12)
        LocalDate amanha = hoje.plusDays(1);
        while (!amanha.isAfter(fimDoAno)) {
            String[] vers = randomVersiculo(rnd);
            list.add(criarDevocional(++index, amanha, randomSubtitle(rnd), vers[0], vers[1], rnd));
            amanha = amanha.plusDays(1);
        }

        devocionalRepository.saveAll(list);
        log.info("Seeded {} devocionais ({} past, 1 today, {} future)", list.size(), DEVOCIONAIS_PASSADOS, list.size() - DEVOCIONAIS_PASSADOS - 1);
    }

    private Devocional criarDevocional(int index, LocalDate data, String subtitulo, String versiculoRef, String versiculoTexto, Random rnd) {
        Devocional d = new Devocional();
        d.setTitulo("Devocional " + index + " - " + subtitulo);
        d.setVersiculoBase(versiculoRef);
        d.setTextoVersiculo(versiculoTexto);
        d.setConteudo("Reflexão sobre o versículo: " + versiculoRef + ".\n\nA Palavra de Deus nos convida a meditar e aplicar em nossa vida. Que este devocional fortaleça sua fé e renove suas esperanças neste dia.");
        d.setDataPublicacao(data);
        return d;
    }

    private String randomSubtitle(Random rnd) {
        String[] parts = {"Esperança", "Fé", "Amor", "Perseverança", "Gratidão", "Perdão", "Sabedoria"};
        return parts[rnd.nextInt(parts.length)];
    }

    private static final String[][] VERSICULOS = {
        {"João 3:16", "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna."},
        {"Salmos 23:1", "O Senhor é o meu pastor; nada me faltará."},
        {"Filipenses 4:13", "Posso todas as coisas naquele que me fortalece."},
        {"Mateus 5:9", "Bem-aventurados os pacificadores, porque eles serão chamados filhos de Deus."},
        {"Romanos 8:28", "E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus."},
        {"Hebreus 11:1", "Ora, a fé é a certeza daquilo que esperamos e a prova das coisas que não vemos."},
    };

    private String[] randomVersiculo(Random rnd) {
        return VERSICULOS[rnd.nextInt(VERSICULOS.length)];
    }
}
