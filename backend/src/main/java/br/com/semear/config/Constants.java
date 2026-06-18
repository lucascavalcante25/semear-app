package br.com.semear.config;

/**
 * Application constants.
 */
public final class Constants {

    // Regex for acceptable logins
    public static final String LOGIN_REGEX = "^(?>[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*)|(?>[_.@A-Za-z0-9-]+)$";

    public static final String SYSTEM = "system";
    public static final String DEFAULT_LANGUAGE = "pt-br";

    /** Nome comercial da plataforma (distinto das igrejas clientes). */
    public static final String NOME_PLATAFORMA = "Minha Igreja Digital";

    /** Empresa desenvolvedora (suporte da plataforma, distinto das igrejas clientes). */
    public static final String EMPRESA_PLATAFORMA = "WillTech Solutions Dev";

    /** Paleta fixa do sistema (verde oliva + azul profundo — padrão Semear). */
    public static final String COR_PRIMARIA_PADRAO = "#5a7a3a";
    public static final String COR_SECUNDARIA_PADRAO = "#1f4d7a";

    private Constants() {}
}
