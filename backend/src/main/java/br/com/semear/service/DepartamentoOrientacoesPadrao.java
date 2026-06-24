package br.com.semear.service;

import br.com.semear.domain.enumeration.CodigoDepartamento;

public final class DepartamentoOrientacoesPadrao {

    public static final String PORTARIA =
        """
        Orientações Gerais — Portaria:
        - Chegue com 15 minutos de antecedência e permaneça até o final do culto.
        - Caso precise trocar de data, avise com antecedência.
        Agradecemos o empenho de todos! Que Deus abençoe ricamente cada vida!
        """.trim();

    public static final String RECEPCAO =
        """
        Orientações Gerais — Recepção:
        - Fique na recepção até o final do louvor com cordialidade e sorriso no rosto.
        - Ajude os visitantes a encontrarem assentos.
        - Após o louvor, leve ao pastor as anotações feitas na recepção.
        Agradecemos o empenho de todos! Que Deus abençoe ricamente cada vida!
        """.trim();

    public static final String LIMPEZA =
        """
        Orientações Gerais — Limpeza:
        - Organize o ambiente antes e após o culto conforme orientação do líder.
        - Verifique salas, banheiros e áreas comuns.
        - Caso precise trocar de data, avise com antecedência.
        """.trim();

    private DepartamentoOrientacoesPadrao() {}

    public static String sugerirPorCodigo(CodigoDepartamento codigo) {
        if (codigo == null) {
            return null;
        }
        return switch (codigo) {
            case PORTARIA -> PORTARIA;
            case RECEPCAO -> RECEPCAO;
            case LIMPEZA -> LIMPEZA;
            case OUTRO -> null;
        };
    }

    public static CodigoDepartamento inferirCodigoPorNome(String nome) {
        if (nome == null) {
            return null;
        }
        String n = nome.trim().toLowerCase();
        if (n.contains("portaria")) {
            return CodigoDepartamento.PORTARIA;
        }
        if (n.contains("recep")) {
            return CodigoDepartamento.RECEPCAO;
        }
        if (n.contains("limpeza") || n.contains("limpe")) {
            return CodigoDepartamento.LIMPEZA;
        }
        return CodigoDepartamento.OUTRO;
    }
}
