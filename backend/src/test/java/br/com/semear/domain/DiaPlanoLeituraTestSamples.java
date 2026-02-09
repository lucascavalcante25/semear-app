package br.com.semear.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class DiaPlanoLeituraTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static DiaPlanoLeitura getDiaPlanoLeituraSample1() {
        return new DiaPlanoLeitura().id(1L).numeroDia(1).titulo("titulo1");
    }

    public static DiaPlanoLeitura getDiaPlanoLeituraSample2() {
        return new DiaPlanoLeitura().id(2L).numeroDia(2).titulo("titulo2");
    }

    public static DiaPlanoLeitura getDiaPlanoLeituraRandomSampleGenerator() {
        return new DiaPlanoLeitura()
            .id(longCount.incrementAndGet())
            .numeroDia(intCount.incrementAndGet())
            .titulo(UUID.randomUUID().toString());
    }
}
