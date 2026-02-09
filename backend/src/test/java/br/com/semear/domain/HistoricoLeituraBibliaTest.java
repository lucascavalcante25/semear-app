package br.com.semear.domain;

import static br.com.semear.domain.HistoricoLeituraBibliaTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import br.com.semear.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class HistoricoLeituraBibliaTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(HistoricoLeituraBiblia.class);
        HistoricoLeituraBiblia historicoLeituraBiblia1 = getHistoricoLeituraBibliaSample1();
        HistoricoLeituraBiblia historicoLeituraBiblia2 = new HistoricoLeituraBiblia();
        assertThat(historicoLeituraBiblia1).isNotEqualTo(historicoLeituraBiblia2);

        historicoLeituraBiblia2.setId(historicoLeituraBiblia1.getId());
        assertThat(historicoLeituraBiblia1).isEqualTo(historicoLeituraBiblia2);

        historicoLeituraBiblia2 = getHistoricoLeituraBibliaSample2();
        assertThat(historicoLeituraBiblia1).isNotEqualTo(historicoLeituraBiblia2);
    }
}
