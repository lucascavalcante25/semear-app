package br.com.semear.service.util;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class NomePessoaUtilsTest {

    @Test
    void formatarNome_converteCaixaAltaComParticulas() {
        assertThat(NomePessoaUtils.formatarNome("LUCAS CAVALCANTE DE QUEIROZ")).isEqualTo("Lucas Cavalcante de Queiroz");
    }

    @Test
    void formatarNome_mantemNomeJaCorreto() {
        assertThat(NomePessoaUtils.formatarNome("Maria da Silva")).isEqualTo("Maria da Silva");
    }

    @Test
    void dividirNomeCompleto_separaPrimeiroNomeESobrenome() {
        String[] partes = NomePessoaUtils.dividirNomeCompleto("ANA PAULA DOS SANTOS");
        assertThat(partes[0]).isEqualTo("Ana");
        assertThat(partes[1]).isEqualTo("Paula dos Santos");
    }
}
