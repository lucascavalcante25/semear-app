package br.com.semear.service.util;

import br.com.semear.domain.CultoRegistro;
import br.com.semear.domain.enumeration.DiaSemanaCulto;
import br.com.semear.domain.enumeration.FrequenciaCulto;
import br.com.semear.domain.enumeration.TipoCulto;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public final class CultoRecorrenciaUtils {

    private CultoRecorrenciaUtils() {}

    public static boolean cultoOcorreNaData(CultoRegistro culto, LocalDate data) {
        if (culto == null || data == null) return false;
        TipoCulto tipo = culto.getTipo() != null ? culto.getTipo() : TipoCulto.RECORRENTE;
        if (tipo == TipoCulto.EXTRAORDINARIO) {
            return data.equals(culto.getDataEspecifica());
        }
        if (!diaCompativel(data, culto.getDiaSemana())) {
            return false;
        }
        FrequenciaCulto freq = culto.getFrequencia() != null ? culto.getFrequencia() : FrequenciaCulto.TODA_SEMANA;
        if (freq != FrequenciaCulto.SEMANAS_ALTERNADAS) {
            return true;
        }
        LocalDate ancora = culto.getDataAncora();
        if (ancora == null) {
            return false;
        }
        return dataEntraNaSerieAlternada(data, ancora);
    }

    /** True se a data está na série da âncora (mesma semana + 0, 14, 28… dias). */
    public static boolean dataEntraNaSerieAlternada(LocalDate data, LocalDate ancora) {
        long dias = ChronoUnit.DAYS.between(ancora, data);
        if (Math.floorMod(dias, 7) != 0) {
            return false;
        }
        long semanas = Math.floorDiv(dias, 7);
        return Math.floorMod(semanas, 2) == 0;
    }

    public static boolean diaCompativel(LocalDate data, DiaSemanaCulto diaSemana) {
        if (data == null || diaSemana == null) return false;
        return switch (data.getDayOfWeek()) {
            case SUNDAY -> diaSemana == DiaSemanaCulto.DOMINGO;
            case MONDAY -> diaSemana == DiaSemanaCulto.SEGUNDA;
            case TUESDAY -> diaSemana == DiaSemanaCulto.TERCA;
            case WEDNESDAY -> diaSemana == DiaSemanaCulto.QUARTA;
            case THURSDAY -> diaSemana == DiaSemanaCulto.QUINTA;
            case FRIDAY -> diaSemana == DiaSemanaCulto.SEXTA;
            case SATURDAY -> diaSemana == DiaSemanaCulto.SABADO;
        };
    }

    public static DiaSemanaCulto diaSemanaDe(LocalDate data) {
        return switch (data.getDayOfWeek()) {
            case SUNDAY -> DiaSemanaCulto.DOMINGO;
            case MONDAY -> DiaSemanaCulto.SEGUNDA;
            case TUESDAY -> DiaSemanaCulto.TERCA;
            case WEDNESDAY -> DiaSemanaCulto.QUARTA;
            case THURSDAY -> DiaSemanaCulto.QUINTA;
            case FRIDAY -> DiaSemanaCulto.SEXTA;
            case SATURDAY -> DiaSemanaCulto.SABADO;
        };
    }
}
