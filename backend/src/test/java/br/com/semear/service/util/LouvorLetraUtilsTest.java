package br.com.semear.service.util;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class LouvorLetraUtilsTest {

    @Test
    void pareceCifra_detectaLinhasSoComAcordes() {
        String cifra = """
            [Intro]
            C#m7 B A7M
            E9 B/D# C#m7 F#m7
            Neste lugar Tu És real
            """;

        assertThat(LouvorLetraUtils.pareceCifra(cifra)).isTrue();
    }

    @Test
    void pareceCifra_aceitaLetraLimpa() {
        String letra = """
            [Refrão]

            Se eu me humilhar
            Diante do Teu Altar
            """;

        assertThat(LouvorLetraUtils.pareceCifra(letra)).isFalse();
    }

    @Test
    void extrairLetraDasLinhas_removeAcordes() {
        List<String> linhas = List.of(
            "[Primeira Parte]",
            "C#m7 B A7M",
            "Neste lugar Tu És real",
            "Vou me entregar totalmente"
        );

        List<String> letra = LouvorLetraUtils.extrairLetraDasLinhas(linhas);

        assertThat(letra).containsExactly(
            "[Primeira Parte]",
            "Neste lugar Tu És real",
            "Vou me entregar totalmente"
        );
    }
}
