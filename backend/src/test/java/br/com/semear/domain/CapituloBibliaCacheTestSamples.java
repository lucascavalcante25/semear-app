package br.com.semear.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class CapituloBibliaCacheTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static CapituloBibliaCache getCapituloBibliaCacheSample1() {
        return new CapituloBibliaCache().id(1L).livroId("livroId1").livroNome("livroNome1").capitulo(1);
    }

    public static CapituloBibliaCache getCapituloBibliaCacheSample2() {
        return new CapituloBibliaCache().id(2L).livroId("livroId2").livroNome("livroNome2").capitulo(2);
    }

    public static CapituloBibliaCache getCapituloBibliaCacheRandomSampleGenerator() {
        return new CapituloBibliaCache()
            .id(longCount.incrementAndGet())
            .livroId(UUID.randomUUID().toString())
            .livroNome(UUID.randomUUID().toString())
            .capitulo(intCount.incrementAndGet());
    }
}
