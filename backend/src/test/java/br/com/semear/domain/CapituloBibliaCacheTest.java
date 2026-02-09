package br.com.semear.domain;

import static br.com.semear.domain.CapituloBibliaCacheTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import br.com.semear.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class CapituloBibliaCacheTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(CapituloBibliaCache.class);
        CapituloBibliaCache capituloBibliaCache1 = getCapituloBibliaCacheSample1();
        CapituloBibliaCache capituloBibliaCache2 = new CapituloBibliaCache();
        assertThat(capituloBibliaCache1).isNotEqualTo(capituloBibliaCache2);

        capituloBibliaCache2.setId(capituloBibliaCache1.getId());
        assertThat(capituloBibliaCache1).isEqualTo(capituloBibliaCache2);

        capituloBibliaCache2 = getCapituloBibliaCacheSample2();
        assertThat(capituloBibliaCache1).isNotEqualTo(capituloBibliaCache2);
    }
}
