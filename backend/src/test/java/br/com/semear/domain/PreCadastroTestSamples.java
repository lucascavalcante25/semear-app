package br.com.semear.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class PreCadastroTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static PreCadastro getPreCadastroSample1() {
        return new PreCadastro()
            .id(1L)
            .nomeCompleto("nomeCompleto1")
            .email("email1")
            .telefone("telefone1")
            .telefoneSecundario("telefoneSecundario1")
            .telefoneEmergencia("telefoneEmergencia1")
            .nomeContatoEmergencia("nomeContatoEmergencia1")
            .cpf("cpf1")
            .login("login1")
            .senha("senha1");
    }

    public static PreCadastro getPreCadastroSample2() {
        return new PreCadastro()
            .id(2L)
            .nomeCompleto("nomeCompleto2")
            .email("email2")
            .telefone("telefone2")
            .telefoneSecundario("telefoneSecundario2")
            .telefoneEmergencia("telefoneEmergencia2")
            .nomeContatoEmergencia("nomeContatoEmergencia2")
            .cpf("cpf2")
            .login("login2")
            .senha("senha2");
    }

    public static PreCadastro getPreCadastroRandomSampleGenerator() {
        return new PreCadastro()
            .id(longCount.incrementAndGet())
            .nomeCompleto(UUID.randomUUID().toString())
            .email(UUID.randomUUID().toString())
            .telefone(UUID.randomUUID().toString())
            .telefoneSecundario(UUID.randomUUID().toString())
            .telefoneEmergencia(UUID.randomUUID().toString())
            .nomeContatoEmergencia(UUID.randomUUID().toString())
            .cpf(UUID.randomUUID().toString())
            .login(UUID.randomUUID().toString())
            .senha(UUID.randomUUID().toString());
    }
}
