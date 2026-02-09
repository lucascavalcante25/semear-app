package br.com.semear.domain;

import static br.com.semear.domain.EnderecoTestSamples.*;
import static br.com.semear.domain.PreCadastroTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import br.com.semear.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class PreCadastroTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(PreCadastro.class);
        PreCadastro preCadastro1 = getPreCadastroSample1();
        PreCadastro preCadastro2 = new PreCadastro();
        assertThat(preCadastro1).isNotEqualTo(preCadastro2);

        preCadastro2.setId(preCadastro1.getId());
        assertThat(preCadastro1).isEqualTo(preCadastro2);

        preCadastro2 = getPreCadastroSample2();
        assertThat(preCadastro1).isNotEqualTo(preCadastro2);
    }

    @Test
    void enderecoTest() {
        PreCadastro preCadastro = getPreCadastroRandomSampleGenerator();
        Endereco enderecoBack = getEnderecoRandomSampleGenerator();

        preCadastro.setEndereco(enderecoBack);
        assertThat(preCadastro.getEndereco()).isEqualTo(enderecoBack);

        preCadastro.endereco(null);
        assertThat(preCadastro.getEndereco()).isNull();
    }
}
