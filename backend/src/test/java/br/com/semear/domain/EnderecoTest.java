package br.com.semear.domain;

import static br.com.semear.domain.EnderecoTestSamples.*;
import static br.com.semear.domain.PreCadastroTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import br.com.semear.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class EnderecoTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Endereco.class);
        Endereco endereco1 = getEnderecoSample1();
        Endereco endereco2 = new Endereco();
        assertThat(endereco1).isNotEqualTo(endereco2);

        endereco2.setId(endereco1.getId());
        assertThat(endereco1).isEqualTo(endereco2);

        endereco2 = getEnderecoSample2();
        assertThat(endereco1).isNotEqualTo(endereco2);
    }

    @Test
    void preCadastroTest() {
        Endereco endereco = getEnderecoRandomSampleGenerator();
        PreCadastro preCadastroBack = getPreCadastroRandomSampleGenerator();

        endereco.setPreCadastro(preCadastroBack);
        assertThat(endereco.getPreCadastro()).isEqualTo(preCadastroBack);
        assertThat(preCadastroBack.getEndereco()).isEqualTo(endereco);

        endereco.preCadastro(null);
        assertThat(endereco.getPreCadastro()).isNull();
        assertThat(preCadastroBack.getEndereco()).isNull();
    }
}
