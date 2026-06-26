package br.com.semear.service.util;

import br.com.semear.domain.Departamento;
import br.com.semear.domain.Escala;
import br.com.semear.domain.EscalaItem;
import br.com.semear.domain.enumeration.CodigoDepartamento;
import br.com.semear.domain.enumeration.StatusEscalaPublicacao;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

public final class EscalaNotificacaoUtils {

    private static final ZoneId ZONE_BR = ZoneId.of("America/Sao_Paulo");
    private static final DateTimeFormatter DATA_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm", Locale.forLanguageTag("pt-BR"));

    /** Lembretes periódicos (domingo/véspera) só quando faltam no máximo estes dias para servir. */
    public static final int DIAS_JANELA_LEMBRETES_PERIODICOS = 15;

    private EscalaNotificacaoUtils() {}

    /** Portaria, recepção e limpeza — departamentos operacionais com escala individual. */
    public static boolean departamentoOperacional(Departamento departamento) {
        if (departamento == null) {
            return false;
        }
        CodigoDepartamento codigo = departamento.getCodigo();
        if (
            CodigoDepartamento.PORTARIA.equals(codigo) ||
            CodigoDepartamento.RECEPCAO.equals(codigo) ||
            CodigoDepartamento.LIMPEZA.equals(codigo)
        ) {
            return true;
        }
        String nome = departamento.getNome() != null ? departamento.getNome().toLowerCase(Locale.ROOT) : "";
        return nome.contains("portaria") || nome.contains("recep") || nome.contains("limpeza");
    }

    public static boolean escalaElegivelParaNotificacao(Escala escala) {
        return escala != null && escala.getStatus() == StatusEscalaPublicacao.PUBLICADA && departamentoOperacional(escala.getDepartamento());
    }

    public static LocalDate dataLocalDaEscala(Escala escala) {
        if (escala == null || escala.getDataEvento() == null) {
            return null;
        }
        return escala.getDataEvento().atZone(ZONE_BR).toLocalDate();
    }

    /** Escala futura (hoje inclusive) dentro da janela de lembretes periódicos. */
    public static boolean escalaDentroDaJanelaLembretesPeriodicos(Escala escala, LocalDate hoje) {
        LocalDate data = dataLocalDaEscala(escala);
        if (data == null || hoje == null) {
            return false;
        }
        long dias = ChronoUnit.DAYS.between(hoje, data);
        return dias >= 0 && dias <= DIAS_JANELA_LEMBRETES_PERIODICOS;
    }

    public static String montarChavePrimeiraNotificacao(Long escalaItemId, Long userId) {
        return String.format("ESCALA_ATRIBUIDA:ESCALA_ITEM:%s:%s", escalaItemId, userId);
    }

    public static String montarDescricao(Escala escala) {
        if (escala == null) {
            return "Escala";
        }
        String departamento = escala.getDepartamento() != null ? escala.getDepartamento().getNome() : null;
        String titulo = escala.getTitulo() != null ? escala.getTitulo() : "Escala";
        String base = departamento != null ? departamento + " — " + titulo : titulo;
        if (escala.getDataEvento() != null) {
            return base + " (" + DATA_FMT.format(escala.getDataEvento().atZone(ZONE_BR)) + ")";
        }
        return base;
    }

    public static String montarRota(Escala escala, EscalaItem item) {
        if (escala == null || escala.getId() == null || item == null || item.getId() == null) {
            return "/escalas";
        }
        return "/escalas?escalaId=" + escala.getId() + "&itemId=" + item.getId();
    }
}
