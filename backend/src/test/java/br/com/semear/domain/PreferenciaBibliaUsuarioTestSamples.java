package br.com.semear.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

public class PreferenciaBibliaUsuarioTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static PreferenciaBibliaUsuario getPreferenciaBibliaUsuarioSample1() {
        return new PreferenciaBibliaUsuario().id(1L);
    }

    public static PreferenciaBibliaUsuario getPreferenciaBibliaUsuarioSample2() {
        return new PreferenciaBibliaUsuario().id(2L);
    }

    public static PreferenciaBibliaUsuario getPreferenciaBibliaUsuarioRandomSampleGenerator() {
        return new PreferenciaBibliaUsuario().id(longCount.incrementAndGet());
    }
}
