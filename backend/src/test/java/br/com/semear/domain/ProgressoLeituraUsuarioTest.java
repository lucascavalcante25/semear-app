package br.com.semear.domain;

import static br.com.semear.domain.DiaPlanoLeituraTestSamples.*;
import static br.com.semear.domain.PlanoLeituraTestSamples.*;
import static br.com.semear.domain.ProgressoLeituraUsuarioTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import br.com.semear.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ProgressoLeituraUsuarioTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ProgressoLeituraUsuario.class);
        ProgressoLeituraUsuario progressoLeituraUsuario1 = getProgressoLeituraUsuarioSample1();
        ProgressoLeituraUsuario progressoLeituraUsuario2 = new ProgressoLeituraUsuario();
        assertThat(progressoLeituraUsuario1).isNotEqualTo(progressoLeituraUsuario2);

        progressoLeituraUsuario2.setId(progressoLeituraUsuario1.getId());
        assertThat(progressoLeituraUsuario1).isEqualTo(progressoLeituraUsuario2);

        progressoLeituraUsuario2 = getProgressoLeituraUsuarioSample2();
        assertThat(progressoLeituraUsuario1).isNotEqualTo(progressoLeituraUsuario2);
    }

    @Test
    void planoTest() {
        ProgressoLeituraUsuario progressoLeituraUsuario = getProgressoLeituraUsuarioRandomSampleGenerator();
        PlanoLeitura planoLeituraBack = getPlanoLeituraRandomSampleGenerator();

        progressoLeituraUsuario.setPlano(planoLeituraBack);
        assertThat(progressoLeituraUsuario.getPlano()).isEqualTo(planoLeituraBack);

        progressoLeituraUsuario.plano(null);
        assertThat(progressoLeituraUsuario.getPlano()).isNull();
    }

    @Test
    void diaTest() {
        ProgressoLeituraUsuario progressoLeituraUsuario = getProgressoLeituraUsuarioRandomSampleGenerator();
        DiaPlanoLeitura diaPlanoLeituraBack = getDiaPlanoLeituraRandomSampleGenerator();

        progressoLeituraUsuario.setDia(diaPlanoLeituraBack);
        assertThat(progressoLeituraUsuario.getDia()).isEqualTo(diaPlanoLeituraBack);

        progressoLeituraUsuario.dia(null);
        assertThat(progressoLeituraUsuario.getDia()).isNull();
    }
}
