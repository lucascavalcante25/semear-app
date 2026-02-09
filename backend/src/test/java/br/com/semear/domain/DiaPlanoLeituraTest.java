package br.com.semear.domain;

import static br.com.semear.domain.DiaPlanoLeituraTestSamples.*;
import static br.com.semear.domain.PlanoLeituraTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import br.com.semear.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class DiaPlanoLeituraTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(DiaPlanoLeitura.class);
        DiaPlanoLeitura diaPlanoLeitura1 = getDiaPlanoLeituraSample1();
        DiaPlanoLeitura diaPlanoLeitura2 = new DiaPlanoLeitura();
        assertThat(diaPlanoLeitura1).isNotEqualTo(diaPlanoLeitura2);

        diaPlanoLeitura2.setId(diaPlanoLeitura1.getId());
        assertThat(diaPlanoLeitura1).isEqualTo(diaPlanoLeitura2);

        diaPlanoLeitura2 = getDiaPlanoLeituraSample2();
        assertThat(diaPlanoLeitura1).isNotEqualTo(diaPlanoLeitura2);
    }

    @Test
    void planoTest() {
        DiaPlanoLeitura diaPlanoLeitura = getDiaPlanoLeituraRandomSampleGenerator();
        PlanoLeitura planoLeituraBack = getPlanoLeituraRandomSampleGenerator();

        diaPlanoLeitura.setPlano(planoLeituraBack);
        assertThat(diaPlanoLeitura.getPlano()).isEqualTo(planoLeituraBack);

        diaPlanoLeitura.plano(null);
        assertThat(diaPlanoLeitura.getPlano()).isNull();
    }

    @Test
    void planoLeituraTest() {
        DiaPlanoLeitura diaPlanoLeitura = getDiaPlanoLeituraRandomSampleGenerator();
        PlanoLeitura planoLeituraBack = getPlanoLeituraRandomSampleGenerator();

        diaPlanoLeitura.setPlanoLeitura(planoLeituraBack);
        assertThat(diaPlanoLeitura.getPlanoLeitura()).isEqualTo(planoLeituraBack);

        diaPlanoLeitura.planoLeitura(null);
        assertThat(diaPlanoLeitura.getPlanoLeitura()).isNull();
    }
}
