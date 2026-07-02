package br.com.semear.service.util;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public final class LouvorLetraUtils {

    private static final Pattern LINHA_TAB = Pattern.compile("^[EBGDA]\\|", Pattern.CASE_INSENSITIVE);
    private static final Pattern ACORDE = Pattern.compile(
        "\\b[A-G][#b]?(?:m|M|maj|min|sus|add|dim|aug)?(?:\\d+)?(?:\\([^)]*\\))?(?:/[A-G][#b]?)?\\b"
    );

    private LouvorLetraUtils() {}

    public static String removerAcordes(String linha) {
        if (linha == null) {
            return "";
        }
        return ACORDE.matcher(linha).replaceAll(" ").replaceAll("\\s+", " ").trim();
    }

    public static boolean contemAcorde(String linha) {
        return linha != null && ACORDE.matcher(linha).find();
    }

    public static boolean pareceCifra(String texto) {
        if (texto == null || texto.isBlank()) {
            return false;
        }

        int linhasComAcordes = 0;
        int linhasLetra = 0;

        for (String linha : texto.split("\n")) {
            String trimmed = linha.trim();
            if (trimmed.isEmpty()) {
                continue;
            }
            if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                continue;
            }
            if (LINHA_TAB.matcher(trimmed).find()) {
                linhasComAcordes++;
                continue;
            }

            if (!contemAcorde(trimmed)) {
                if (trimmed.length() >= 8) {
                    linhasLetra++;
                }
                continue;
            }

            String semAcordes = removerAcordes(trimmed);
            if (semAcordes.length() < 3) {
                linhasComAcordes++;
            } else if (trimmed.length() > semAcordes.length() + 4) {
                linhasComAcordes++;
            } else if (semAcordes.length() >= 8) {
                linhasLetra++;
            }
        }

        return linhasComAcordes >= 2 || (linhasComAcordes >= 1 && linhasLetra == 0);
    }

    public static List<String> extrairLetraDasLinhas(List<String> linhasOrigem) {
        List<String> linhasLetra = new ArrayList<>();
        for (String linha : linhasOrigem) {
            String trimmed = linha.trim();
            if (trimmed.isEmpty()) {
                if (!linhasLetra.isEmpty() && !linhasLetra.get(linhasLetra.size() - 1).isEmpty()) {
                    linhasLetra.add("");
                }
                continue;
            }
            if (LINHA_TAB.matcher(trimmed).find()) {
                continue;
            }
            if (trimmed.matches("(?i)^parte\\s+\\d+\\s+de\\s+\\d+$")) {
                continue;
            }
            if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                linhasLetra.add(trimmed);
                continue;
            }

            String semAcordes = removerAcordes(trimmed);
            if (semAcordes.length() >= 3 && semAcordes.matches(".*[a-zA-ZÀ-ÿ]{2,}.*")) {
                linhasLetra.add(semAcordes);
            }
        }

        while (!linhasLetra.isEmpty() && linhasLetra.get(linhasLetra.size() - 1).isEmpty()) {
            linhasLetra.remove(linhasLetra.size() - 1);
        }
        return linhasLetra;
    }

    public static boolean pareceLetra(List<String> linhas) {
        if (linhas == null || linhas.isEmpty()) {
            return false;
        }
        String texto = String.join("\n", linhas);
        if (pareceCifra(texto)) {
            return false;
        }

        int comTexto = 0;
        for (String linha : linhas) {
            String trimmed = linha.trim();
            if (trimmed.isEmpty() || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
                continue;
            }
            String semAcordes = removerAcordes(trimmed);
            if (semAcordes.length() >= 8 && semAcordes.matches(".*[a-zA-ZÀ-ÿ]{3,}.*")) {
                comTexto++;
            }
        }
        return comTexto >= 2;
    }
}
