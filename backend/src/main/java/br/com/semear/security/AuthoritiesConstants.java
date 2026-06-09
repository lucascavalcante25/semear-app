package br.com.semear.security;

/**
 * Constants for Spring Security authorities.
 */
public final class AuthoritiesConstants {

    public static final String SUPER_ADMIN = "ROLE_SUPER_ADMIN";

    public static final String ADMIN_IGREJA = "ROLE_ADMIN_IGREJA";

    public static final String ADMIN = "ROLE_ADMIN";

    public static final String USER = "ROLE_USER";

    public static final String PASTOR = "ROLE_PASTOR";

    public static final String COPASTOR = "ROLE_COPASTOR";

    public static final String SECRETARIA = "ROLE_SECRETARIA";

    public static final String TESOURARIA = "ROLE_TESOURARIA";

    public static final String LIDER = "ROLE_LIDER";

    public static final String MEMBRO = "ROLE_MEMBRO";

    public static final String VISITANTE = "ROLE_VISITANTE";

    public static final String ANONYMOUS = "ROLE_ANONYMOUS";

    private AuthoritiesConstants() {}
}
