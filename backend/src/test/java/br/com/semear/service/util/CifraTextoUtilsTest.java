package br.com.semear.service.util;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class CifraTextoUtilsTest {

    @Test
    void removeRestoHtmlCifraClub() {
        String bruto = """
            [Intro] G C9 Em7
            ">D
            G C9 Em7
            ">D
            [Primeira Parte]
            ">D
            [Primeira Parte]
            """;
        String limpo = CifraTextoUtils.sanitizar(bruto);
        assertThat(limpo).doesNotContain("\">");
        assertThat(limpo.lines().filter(l -> l.equals("[Primeira Parte]")).count()).isEqualTo(1);
    }

    @Test
    void removeFrasesDuplicadas() {
        String bruto = """
            G                    C9
            Eu vejo a glória do Senhor hoje aqui
            G                    C9
            Eu vejo a glória do Senhor hoje aqui
            """;
        String limpo = CifraTextoUtils.sanitizar(bruto);
        assertThat(limpo.lines().filter(l -> l.contains("Eu vejo a glória")).count()).isEqualTo(1);
    }

    @Test
    void preservaCifraLimpa() {
        String limpa = "[Intro] G  C9  Em7  D\n\nG                    C9\nEu vejo a glória";
        assertThat(CifraTextoUtils.sanitizar(limpa)).isEqualTo(limpa);
    }
}
