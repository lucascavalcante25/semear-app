package br.com.semear.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class NotaBibliaTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static NotaBiblia getNotaBibliaSample1() {
        return new NotaBiblia()
            .id(1L)
            .chaveReferencia("chaveReferencia1")
            .livroId("livroId1")
            .livroNome("livroNome1")
            .capitulo(1)
            .versiculoInicio(1)
            .versiculoFim(1);
    }

    public static NotaBiblia getNotaBibliaSample2() {
        return new NotaBiblia()
            .id(2L)
            .chaveReferencia("chaveReferencia2")
            .livroId("livroId2")
            .livroNome("livroNome2")
            .capitulo(2)
            .versiculoInicio(2)
            .versiculoFim(2);
    }

    public static NotaBiblia getNotaBibliaRandomSampleGenerator() {
        return new NotaBiblia()
            .id(longCount.incrementAndGet())
            .chaveReferencia(UUID.randomUUID().toString())
            .livroId(UUID.randomUUID().toString())
            .livroNome(UUID.randomUUID().toString())
            .capitulo(intCount.incrementAndGet())
            .versiculoInicio(intCount.incrementAndGet())
            .versiculoFim(intCount.incrementAndGet());
    }
}
