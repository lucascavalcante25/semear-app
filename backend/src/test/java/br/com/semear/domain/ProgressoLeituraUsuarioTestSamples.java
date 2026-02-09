package br.com.semear.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

public class ProgressoLeituraUsuarioTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static ProgressoLeituraUsuario getProgressoLeituraUsuarioSample1() {
        return new ProgressoLeituraUsuario().id(1L);
    }

    public static ProgressoLeituraUsuario getProgressoLeituraUsuarioSample2() {
        return new ProgressoLeituraUsuario().id(2L);
    }

    public static ProgressoLeituraUsuario getProgressoLeituraUsuarioRandomSampleGenerator() {
        return new ProgressoLeituraUsuario().id(longCount.incrementAndGet());
    }
}
