package br.com.semear.service.util;

import br.com.semear.domain.Departamento;
import br.com.semear.domain.Escala;
import br.com.semear.domain.EscalaItem;
import br.com.semear.domain.enumeration.CodigoDepartamento;
import br.com.semear.domain.enumeration.StatusEscalaPublicacao;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public final class EscalaNotificacaoUtils {

    private static final ZoneId ZONE_BR = ZoneId.of("America/Sao_Paulo");
    private static final DateTimeFormatter DATA_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm", Locale.forLanguageTag("pt-BR"));

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
