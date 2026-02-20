package br.com.semear.domain.enumeration;

/**
 * Tipo do Louvor para classificação no repertório.
 */
public enum TipoLouvor {
    JUBILO("Júbilo"),
    ADORACAO("Adoração"),
    CEIA("Ceia");

    private final String label;

    TipoLouvor(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
