package br.com.semear.domain;

import static br.com.semear.domain.FavoritoBibliaTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import br.com.semear.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class FavoritoBibliaTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(FavoritoBiblia.class);
        FavoritoBiblia favoritoBiblia1 = getFavoritoBibliaSample1();
        FavoritoBiblia favoritoBiblia2 = new FavoritoBiblia();
        assertThat(favoritoBiblia1).isNotEqualTo(favoritoBiblia2);

        favoritoBiblia2.setId(favoritoBiblia1.getId());
        assertThat(favoritoBiblia1).isEqualTo(favoritoBiblia2);

        favoritoBiblia2 = getFavoritoBibliaSample2();
        assertThat(favoritoBiblia1).isNotEqualTo(favoritoBiblia2);
    }
}
