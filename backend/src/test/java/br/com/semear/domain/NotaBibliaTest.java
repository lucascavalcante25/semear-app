package br.com.semear.domain;

import static br.com.semear.domain.NotaBibliaTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import br.com.semear.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class NotaBibliaTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(NotaBiblia.class);
        NotaBiblia notaBiblia1 = getNotaBibliaSample1();
        NotaBiblia notaBiblia2 = new NotaBiblia();
        assertThat(notaBiblia1).isNotEqualTo(notaBiblia2);

        notaBiblia2.setId(notaBiblia1.getId());
        assertThat(notaBiblia1).isEqualTo(notaBiblia2);

        notaBiblia2 = getNotaBibliaSample2();
        assertThat(notaBiblia1).isNotEqualTo(notaBiblia2);
    }
}
