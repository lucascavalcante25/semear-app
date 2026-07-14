package br.com.semear.service.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

/** Regras do lembrete push de culto (horas antes + janela do job). */
public final class CultoLembreteUtils {

    public static final int HORAS_ANTES_PADRAO = 2;
    public static final int MINUTOS_JANELA_PADRAO = 15;
    public static final ZoneId ZONE_BR = ZoneId.of("America/Sao_Paulo");
    private static final DateTimeFormatter HORA_FMT = DateTimeFormatter.ofPattern("HH:mm", Locale.forLanguageTag("pt-BR"));

    private CultoLembreteUtils() {}

    public static LocalTime parseHorario(String horario) {
        if (horario == null || horario.isBlank()) {
            return null;
        }
        String t = horario.trim();
        try {
            if (t.length() == 5) {
                return LocalTime.parse(t, HORA_FMT);
            }
            return LocalTime.parse(t);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * True se {@code agora} está na janela [culto − horasAntes, culto − horasAntes + minutosJanela).
     */
    public static boolean estaNaJanelaLembrete(
        Instant agora,
        LocalDate dataCulto,
        LocalTime horarioCulto,
        int horasAntes,
        int minutosJanela
    ) {
        if (agora == null || dataCulto == null || horarioCulto == null) {
            return false;
        }
        Instant instanteCulto = dataCulto.atTime(horarioCulto).atZone(ZONE_BR).toInstant();
        Instant alvo = instanteCulto.minus(horasAntes, ChronoUnit.HOURS);
        Instant fimJanela = alvo.plus(minutosJanela, ChronoUnit.MINUTES);
        return !agora.isBefore(alvo) && agora.isBefore(fimJanela);
    }

    public static boolean estaNaJanelaLembretePadrao(Instant agora, LocalDate dataCulto, LocalTime horarioCulto) {
        return estaNaJanelaLembrete(agora, dataCulto, horarioCulto, HORAS_ANTES_PADRAO, MINUTOS_JANELA_PADRAO);
    }
}
