package br.com.semear.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class EnderecoTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Endereco getEnderecoSample1() {
        return new Endereco()
            .id(1L)
            .logradouro("logradouro1")
            .numero("numero1")
            .complemento("complemento1")
            .bairro("bairro1")
            .cidade("cidade1")
            .estado("estado1")
            .cep("cep1");
    }

    public static Endereco getEnderecoSample2() {
        return new Endereco()
            .id(2L)
            .logradouro("logradouro2")
            .numero("numero2")
            .complemento("complemento2")
            .bairro("bairro2")
            .cidade("cidade2")
            .estado("estado2")
            .cep("cep2");
    }

    public static Endereco getEnderecoRandomSampleGenerator() {
        return new Endereco()
            .id(longCount.incrementAndGet())
            .logradouro(UUID.randomUUID().toString())
            .numero(UUID.randomUUID().toString())
            .complemento(UUID.randomUUID().toString())
            .bairro(UUID.randomUUID().toString())
            .cidade(UUID.randomUUID().toString())
            .estado(UUID.randomUUID().toString())
            .cep(UUID.randomUUID().toString());
    }
}
