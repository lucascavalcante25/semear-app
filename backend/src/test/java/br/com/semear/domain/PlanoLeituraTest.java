package br.com.semear.domain;

import static br.com.semear.domain.DiaPlanoLeituraTestSamples.*;
import static br.com.semear.domain.PlanoLeituraTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import br.com.semear.web.rest.TestUtil;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class PlanoLeituraTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(PlanoLeitura.class);
        PlanoLeitura planoLeitura1 = getPlanoLeituraSample1();
        PlanoLeitura planoLeitura2 = new PlanoLeitura();
        assertThat(planoLeitura1).isNotEqualTo(planoLeitura2);

        planoLeitura2.setId(planoLeitura1.getId());
        assertThat(planoLeitura1).isEqualTo(planoLeitura2);

        planoLeitura2 = getPlanoLeituraSample2();
        assertThat(planoLeitura1).isNotEqualTo(planoLeitura2);
    }

    @Test
    void diasTest() {
        PlanoLeitura planoLeitura = getPlanoLeituraRandomSampleGenerator();
        DiaPlanoLeitura diaPlanoLeituraBack = getDiaPlanoLeituraRandomSampleGenerator();

        planoLeitura.addDias(diaPlanoLeituraBack);
        assertThat(planoLeitura.getDias()).containsOnly(diaPlanoLeituraBack);
        assertThat(diaPlanoLeituraBack.getPlanoLeitura()).isEqualTo(planoLeitura);

        planoLeitura.removeDias(diaPlanoLeituraBack);
        assertThat(planoLeitura.getDias()).doesNotContain(diaPlanoLeituraBack);
        assertThat(diaPlanoLeituraBack.getPlanoLeitura()).isNull();

        planoLeitura.dias(new HashSet<>(Set.of(diaPlanoLeituraBack)));
        assertThat(planoLeitura.getDias()).containsOnly(diaPlanoLeituraBack);
        assertThat(diaPlanoLeituraBack.getPlanoLeitura()).isEqualTo(planoLeitura);

        planoLeitura.setDias(new HashSet<>());
        assertThat(planoLeitura.getDias()).doesNotContain(diaPlanoLeituraBack);
        assertThat(diaPlanoLeituraBack.getPlanoLeitura()).isNull();
    }
}
