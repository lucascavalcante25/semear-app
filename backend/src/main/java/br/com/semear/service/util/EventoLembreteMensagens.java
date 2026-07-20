package br.com.semear.service.util;

import br.com.semear.domain.Evento;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

public final class EventoLembreteMensagens {

    private static final DateTimeFormatter HORA_FMT = DateTimeFormatter.ofPattern("HH:mm", Locale.forLanguageTag("pt-BR"));

    private EventoLembreteMensagens() {}

    public record TextoLembrete(String titulo, String mensagem) {}

    public static TextoLembrete montar(Evento evento) {
        return montar(evento, ZoneId.of("America/Sao_Paulo"));
    }

    public static TextoLembrete montar(Evento evento, ZoneId zone) {
        if (evento == null || evento.getDataInicio() == null) {
            return new TextoLembrete("Lembrete de evento", evento != null ? evento.getTitulo() : "");
        }
        LocalDate hoje = LocalDate.now(zone);
        LocalDate dataEvento = evento.getDataInicio().atZone(zone).toLocalDate();
        long dias = ChronoUnit.DAYS.between(hoje, dataEvento);
        String hora = formatarHora(evento.getDataInicio(), zone);
        String tituloEvento = evento.getTitulo() != null ? evento.getTitulo() : "Evento";

        if (dias == 0) {
            return new TextoLembrete("Evento hoje", "Hoje: \"" + tituloEvento + "\" às " + hora + ".");
        }
        if (dias == 1) {
            return new TextoLembrete("Evento amanhã", "Amanhã: \"" + tituloEvento + "\" às " + hora + ".");
        }
        if (dias > 1) {
            return new TextoLembrete(
                "Lembrete de evento",
                "Em " + dias + " dias: \"" + tituloEvento + "\" (" + hora + ")."
            );
        }
        return new TextoLembrete("Lembrete de evento", "\"" + tituloEvento + "\" já passou.");
    }

    public static boolean ehTipoLembreteEvento(String tipo) {
        if (tipo == null || tipo.isBlank()) {
            return false;
        }
        return tipo.startsWith("EVENTO_LEMBRETE");
    }

    private static String formatarHora(Instant instant, ZoneId zone) {
        return HORA_FMT.format(instant.atZone(zone));
    }
}
