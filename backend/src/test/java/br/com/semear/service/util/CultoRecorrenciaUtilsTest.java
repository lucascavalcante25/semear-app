package br.com.semear.service.util;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.semear.domain.CultoRegistro;
import br.com.semear.domain.enumeration.DiaSemanaCulto;
import br.com.semear.domain.enumeration.FrequenciaCulto;
import br.com.semear.domain.enumeration.TipoCulto;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class CultoRecorrenciaUtilsTest {

    @Test
    void todaSemanaOcorreNasTercas() {
        CultoRegistro culto = recorrente("Oração", DiaSemanaCulto.TERCA, FrequenciaCulto.TODA_SEMANA, null);
        assertThat(CultoRecorrenciaUtils.cultoOcorreNaData(culto, LocalDate.of(2026, 7, 14))).isTrue();
        assertThat(CultoRecorrenciaUtils.cultoOcorreNaData(culto, LocalDate.of(2026, 7, 21))).isTrue();
        assertThat(CultoRecorrenciaUtils.cultoOcorreNaData(culto, LocalDate.of(2026, 7, 15))).isFalse();
    }

    @Test
    void semanasAlternadasRespeitaAncora() {
        LocalDate ancora = LocalDate.of(2026, 7, 14); // terça
        CultoRegistro oracao = recorrente("Oração", DiaSemanaCulto.TERCA, FrequenciaCulto.SEMANAS_ALTERNADAS, ancora);
        CultoRegistro escola = recorrente(
            "Escola Bíblica",
            DiaSemanaCulto.TERCA,
            FrequenciaCulto.SEMANAS_ALTERNADAS,
            ancora.plusWeeks(1)
        );

        assertThat(CultoRecorrenciaUtils.cultoOcorreNaData(oracao, LocalDate.of(2026, 7, 14))).isTrue();
        assertThat(CultoRecorrenciaUtils.cultoOcorreNaData(oracao, LocalDate.of(2026, 7, 21))).isFalse();
        assertThat(CultoRecorrenciaUtils.cultoOcorreNaData(oracao, LocalDate.of(2026, 7, 28))).isTrue();

        assertThat(CultoRecorrenciaUtils.cultoOcorreNaData(escola, LocalDate.of(2026, 7, 14))).isFalse();
        assertThat(CultoRecorrenciaUtils.cultoOcorreNaData(escola, LocalDate.of(2026, 7, 21))).isTrue();
        assertThat(CultoRecorrenciaUtils.cultoOcorreNaData(escola, LocalDate.of(2026, 7, 28))).isFalse();
    }

    private CultoRegistro recorrente(String nome, DiaSemanaCulto dia, FrequenciaCulto freq, LocalDate ancora) {
        CultoRegistro c = new CultoRegistro();
        c.setNome(nome);
        c.setDiaSemana(dia);
        c.setHorario("19:00");
        c.setTipo(TipoCulto.RECORRENTE);
        c.setFrequencia(freq);
        c.setDataAncora(ancora);
        c.setAtivo(true);
        return c;
    }
}
