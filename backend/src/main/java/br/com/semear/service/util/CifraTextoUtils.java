package br.com.semear.service.util;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Limpa cola do Cifra Club (restos de HTML como {@code ">D}) e linhas duplicadas.
 */
public final class CifraTextoUtils {

    private static final Pattern LIXO_HTML = Pattern.compile("^\\s*[\"']\\s*>|^\\s*>[A-G]");
    private static final Pattern TAG_HTML = Pattern.compile("(?i)</?[a-z][^>]*>");
    private static final Pattern RESTO_ASPAS_MAIOR = Pattern.compile("[\"']\\s*>\\s*(?=[A-G])");
    private static final Pattern RESTO_MAIOR_INICIO = Pattern.compile("^\\s*>\\s*(?=[A-G])");
    private static final Pattern SO_LIXO = Pattern.compile("^\\s*[>\"']+\\s*$");
    private static final Pattern ACORDE = Pattern.compile(
        "^[A-G](?:#|b)?(?:m|M|maj|min|dim|aug|sus|add)?[0-9]*(?:/[A-G](?:#|b)?)?$"
    );

    private CifraTextoUtils() {}

    public static String sanitizar(String texto) {
        if (texto == null || texto.isBlank()) {
            return texto == null ? "" : texto;
        }
        List<String> linhas = sanitizarLinhas(List.of(texto.replace("\r\n", "\n").replace('\r', '\n').split("\n", -1)));
        return String.join("\n", linhas);
    }

    public static List<String> sanitizarLinhas(List<String> origem) {
        List<String> normalizadas = new ArrayList<>();
        for (String original : origem) {
            boolean eraLixoHtml = LIXO_HTML.matcher(original).find();
            String linha = original
                .replace('\u00a0', ' ')
                .replace("\t", "    ")
                .replace("&nbsp;", " ")
                .replace("&quot;", "\"")
                .replace("&#34;", "\"")
                .replace("&gt;", ">")
                .replace("&#62;", ">")
                .replace("&lt;", "<")
                .replace("&amp;", "&");

            linha = linha.replaceAll("(?i)<br\\s*/?>", "\n");
            linha = linha.replaceAll("(?i)</(p|div|tr|li|h[1-6])>", "\n");
            linha = TAG_HTML.matcher(linha).replaceAll("");
            linha = RESTO_ASPAS_MAIOR.matcher(linha).replaceAll("");
            linha = RESTO_MAIOR_INICIO.matcher(linha).replaceAll("");

            for (String pedaco : linha.split("\n", -1)) {
                String limpa = pedaco.stripTrailing();
                if (SO_LIXO.matcher(limpa).matches()) {
                    continue;
                }
                if (eraLixoHtml && pareceSoAcorde(limpa.trim())) {
                    continue;
                }
                normalizadas.add(limpa);
            }
        }
        return deduplicar(normalizadas);
    }

    public static List<String> deduplicar(List<String> linhas) {
        List<String> out = new ArrayList<>();
        for (int i = 0; i < linhas.size(); i++) {
            String atual = linhas.get(i);
            String proxima = i + 1 < linhas.size() ? linhas.get(i + 1) : null;
            String depois = i + 2 < linhas.size() ? linhas.get(i + 2) : null;
            String quarta = i + 3 < linhas.size() ? linhas.get(i + 3) : null;
            if (proxima != null && atual.equals(proxima)) {
                continue;
            }
            if (proxima != null && depois != null && quarta != null && atual.equals(depois) && proxima.equals(quarta)) {
                i++;
                continue;
            }
            out.add(atual);
        }
        while (!out.isEmpty() && out.get(out.size() - 1).isBlank()) {
            out.remove(out.size() - 1);
        }
        return out;
    }

    private static boolean pareceSoAcorde(String texto) {
        if (texto == null || texto.isBlank()) {
            return false;
        }
        if (ACORDE.matcher(texto).matches()) {
            return true;
        }
        String[] tokens = texto.split("\\s+");
        if (tokens.length == 0) {
            return false;
        }
        int acordes = 0;
        for (String token : tokens) {
            if (ACORDE.matcher(token).matches() || token.equals("|") || token.equals("-")) {
                acordes++;
            }
        }
        return acordes * 10 >= tokens.length * 6;
    }
}
