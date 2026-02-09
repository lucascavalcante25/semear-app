package br.com.semear.domain;

import static br.com.semear.domain.PreferenciaBibliaUsuarioTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import br.com.semear.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class PreferenciaBibliaUsuarioTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(PreferenciaBibliaUsuario.class);
        PreferenciaBibliaUsuario preferenciaBibliaUsuario1 = getPreferenciaBibliaUsuarioSample1();
        PreferenciaBibliaUsuario preferenciaBibliaUsuario2 = new PreferenciaBibliaUsuario();
        assertThat(preferenciaBibliaUsuario1).isNotEqualTo(preferenciaBibliaUsuario2);

        preferenciaBibliaUsuario2.setId(preferenciaBibliaUsuario1.getId());
        assertThat(preferenciaBibliaUsuario1).isEqualTo(preferenciaBibliaUsuario2);

        preferenciaBibliaUsuario2 = getPreferenciaBibliaUsuarioSample2();
        assertThat(preferenciaBibliaUsuario1).isNotEqualTo(preferenciaBibliaUsuario2);
    }
}
