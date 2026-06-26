package br.com.semear.service.util;

import java.util.Locale;
import java.util.Set;

/**
 * Normaliza nomes próprios para o padrão brasileiro:
 * primeiras letras maiúsculas e partículas (de, da, do...) em minúsculas.
 */
public final class NomePessoaUtils {

    private static final Locale PT_BR = Locale.forLanguageTag("pt-BR");
    private static final Set<String> PARTICULAS = Set.of("de", "da", "do", "das", "dos", "e");

    private NomePessoaUtils() {}

    public static String formatarNome(String nome) {
        if (nome == null) {
            return null;
        }
        String trimmed = nome.trim().replaceAll("\\s+", " ");
        if (trimmed.isEmpty()) {
            return trimmed;
        }
        String[] palavras = trimmed.split(" ");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < palavras.length; i++) {
            if (i > 0) {
                sb.append(' ');
            }
            sb.append(formatarPalavra(palavras[i], i == 0));
        }
        return sb.toString();
    }

    public static String[] dividirNomeCompleto(String nomeCompleto) {
        String formatado = formatarNome(nomeCompleto);
        if (formatado == null || formatado.isBlank()) {
            return new String[] { "", "" };
        }
        String[] partes = formatado.split("\\s+", 2);
        return new String[] { partes[0], partes.length > 1 ? partes[1] : "" };
    }

    private static String formatarPalavra(String palavra, boolean primeiraDoNome) {
        if (palavra.isEmpty()) {
            return palavra;
        }
        if (palavra.contains("-")) {
            String[] partes = palavra.split("-");
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < partes.length; i++) {
                if (i > 0) {
                    sb.append('-');
                }
                sb.append(formatarToken(partes[i], primeiraDoNome && i == 0));
            }
            return sb.toString();
        }
        if (palavra.contains("'")) {
            String[] partes = palavra.split("'", -1);
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < partes.length; i++) {
                if (i > 0) {
                    sb.append('\'');
                }
                sb.append(formatarToken(partes[i], primeiraDoNome && i == 0));
            }
            return sb.toString();
        }
        return formatarToken(palavra, primeiraDoNome);
    }

    private static String formatarToken(String token, boolean capitalizar) {
        if (token.isEmpty()) {
            return token;
        }
        String lower = token.toLowerCase(PT_BR);
        if (!capitalizar && PARTICULAS.contains(lower)) {
            return lower;
        }
        if (lower.length() == 1) {
            return lower.toUpperCase(PT_BR);
        }
        return lower.substring(0, 1).toUpperCase(PT_BR) + lower.substring(1);
    }
}
