package br.com.semear.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class PlanoLeituraTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static PlanoLeitura getPlanoLeituraSample1() {
        return new PlanoLeitura().id(1L).nome("nome1").descricao("descricao1");
    }

    public static PlanoLeitura getPlanoLeituraSample2() {
        return new PlanoLeitura().id(2L).nome("nome2").descricao("descricao2");
    }

    public static PlanoLeitura getPlanoLeituraRandomSampleGenerator() {
        return new PlanoLeitura()
            .id(longCount.incrementAndGet())
            .nome(UUID.randomUUID().toString())
            .descricao(UUID.randomUUID().toString());
    }
}
