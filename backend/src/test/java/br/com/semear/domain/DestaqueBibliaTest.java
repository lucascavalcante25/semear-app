package br.com.semear.domain;

import static br.com.semear.domain.DestaqueBibliaTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import br.com.semear.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class DestaqueBibliaTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(DestaqueBiblia.class);
        DestaqueBiblia destaqueBiblia1 = getDestaqueBibliaSample1();
        DestaqueBiblia destaqueBiblia2 = new DestaqueBiblia();
        assertThat(destaqueBiblia1).isNotEqualTo(destaqueBiblia2);

        destaqueBiblia2.setId(destaqueBiblia1.getId());
        assertThat(destaqueBiblia1).isEqualTo(destaqueBiblia2);

        destaqueBiblia2 = getDestaqueBibliaSample2();
        assertThat(destaqueBiblia1).isNotEqualTo(destaqueBiblia2);
    }
}
