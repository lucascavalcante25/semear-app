package br.com.semear.service.util;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import org.junit.jupiter.api.Test;

class CultoLembreteUtilsTest {

    private static final ZoneId ZONE = CultoLembreteUtils.ZONE_BR;

    @Test
    void parseHorarioAceitaHhMm() {
        assertThat(CultoLembreteUtils.parseHorario("19:00")).isEqualTo(LocalTime.of(19, 0));
        assertThat(CultoLembreteUtils.parseHorario(" 09:30 ")).isEqualTo(LocalTime.of(9, 30));
        assertThat(CultoLembreteUtils.parseHorario(null)).isNull();
        assertThat(CultoLembreteUtils.parseHorario("")).isNull();
        assertThat(CultoLembreteUtils.parseHorario("abc")).isNull();
    }

    @Test
    void janelaDisparaDuasHorasAntes() {
        LocalDate data = LocalDate.of(2026, 7, 14);
        LocalTime horario = LocalTime.of(19, 0);
        // culto 19:00 → alvo 17:00
        Instant exatamenteAlvo = data.atTime(17, 0).atZone(ZONE).toInstant();
        Instant dentroJanela = data.atTime(17, 10).atZone(ZONE).toInstant();
        Instant depoisJanela = data.atTime(17, 15).atZone(ZONE).toInstant();
        Instant cedoDemais = data.atTime(16, 59).atZone(ZONE).toInstant();

        assertThat(CultoLembreteUtils.estaNaJanelaLembretePadrao(exatamenteAlvo, data, horario)).isTrue();
        assertThat(CultoLembreteUtils.estaNaJanelaLembretePadrao(dentroJanela, data, horario)).isTrue();
        assertThat(CultoLembreteUtils.estaNaJanelaLembretePadrao(depoisJanela, data, horario)).isFalse();
        assertThat(CultoLembreteUtils.estaNaJanelaLembretePadrao(cedoDemais, data, horario)).isFalse();
    }

    @Test
    void preCadastroOptInDefaults() {
        // sanity do contract: receberNotificacoes null tratado como false no setter da entity
        br.com.semear.domain.PreCadastro pre = new br.com.semear.domain.PreCadastro();
        pre.setReceberNotificacoes(null);
        assertThat(pre.getReceberNotificacoes()).isFalse();
        pre.setReceberNotificacoes(true);
        assertThat(pre.getReceberNotificacoes()).isTrue();
        pre.setPushToken("token-fcm");
        assertThat(pre.getPushToken()).isEqualTo("token-fcm");
    }
}
