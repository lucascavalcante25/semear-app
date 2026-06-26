package br.com.semear.service;

import br.com.semear.domain.User;
import br.com.semear.domain.enumeration.NivelAcessoModulo;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Valida acesso a módulos com base em user.modules (CSV) ou permissões padrão do role.
 * Espelha a lógica do frontend permissions.ts.
 */
@Service
@Transactional(readOnly = true)
public class ModuleAccessService {

    private static final String ENTITY = "moduleAccess";

    public static final List<String> MODULOS = List.of(
        "dashboard",
        "biblia",
        "devocionais",
        "louvores",
        "membros",
        "visitantes",
        "comunicados",
        "financeiro",
        "oracao",
        "aprovar-pre-cadastros",
        "configuracoes",
        "departamentos",
        "escalas",
        "eventos"
    );

    private static final Set<String> ROLES_FULL_ACCESS = Set.of(
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR
    );

    private static final List<String> SECRETARIA_MODULES = List.of(
        "dashboard",
        "biblia",
        "devocionais",
        "louvores",
        "membros",
        "visitantes",
        "comunicados",
        "oracao",
        "departamentos",
        "escalas",
        "eventos",
        "aprovar-pre-cadastros",
        "configuracoes"
    );

    private static final List<String> TESOURARIA_MODULES = List.of(
        "dashboard",
        "biblia",
        "devocionais",
        "comunicados",
        "financeiro",
        "oracao",
        "configuracoes"
    );

    private static final List<String> LIDER_WRITE_MODULES = List.of(
        "dashboard",
        "biblia",
        "devocionais",
        "louvores",
        "oracao",
        "departamentos",
        "escalas",
        "eventos",
        "configuracoes",
        "comunicados"
    );

    private static final List<String> LIDER_READ_MODULES = List.of("membros", "visitantes", "comunicados");

    private static final List<String> MEMBRO_READ_MODULES = List.of(
        "dashboard",
        "biblia",
        "devocionais",
        "comunicados",
        "eventos",
        "configuracoes"
    );

    private static final List<String> MEMBRO_WRITE_MODULES = List.of("oracao");

    private static final List<String> VISITANTE_MODULES = List.of("biblia", "oracao", "configuracoes");

    private final TenantService tenantService;

    public ModuleAccessService(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    public boolean hasModuleAccess(String module, NivelAcessoModulo nivel) {
        return hasModuleAccess(tenantService.getUsuarioAtual(), module, nivel);
    }

    public boolean hasModuleAccess(User user, String module, NivelAcessoModulo nivel) {
        if (user == null || module == null || nivel == null) {
            return false;
        }
        if (tenantService.isSuperAdmin() || temAcessoTotalPorRole(user)) {
            return true;
        }
        if (temAcessoModulo(user, module, nivel)) {
            return true;
        }
        if ("comunicados".equals(module)) {
            if (temAcessoModulo(user, "avisos", nivel) || temAcessoModulo(user, "informativos", nivel)) {
                return true;
            }
        }
        if (("avisos".equals(module) || "informativos".equals(module)) && temAcessoModulo(user, "comunicados", nivel)) {
            return true;
        }
        return false;
    }

    private boolean temAcessoModulo(User user, String module, NivelAcessoModulo nivel) {
        Map<String, NivelAcessoModulo> perms = obterPermissoesEfetivas(user);
        NivelAcessoModulo access = perms.get(module);
        if (access == null) {
            return false;
        }
        if (nivel == NivelAcessoModulo.READ) {
            return access == NivelAcessoModulo.READ || access == NivelAcessoModulo.WRITE;
        }
        return access == NivelAcessoModulo.WRITE;
    }

    public void assertModuleAccess(String module, NivelAcessoModulo nivel) {
        if (!hasModuleAccess(module, nivel)) {
            throw new BadRequestAlertException(
                "Acesso negado ao módulo " + module,
                ENTITY,
                "acessonegado"
            );
        }
    }

    private boolean temAcessoTotalPorRole(User user) {
        return user.getAuthorities().stream().anyMatch(a -> ROLES_FULL_ACCESS.contains(a.getName()));
    }

    private Map<String, NivelAcessoModulo> obterPermissoesEfetivas(User user) {
        Map<String, NivelAcessoModulo> parsed = parseModulos(user.getModules());
        if (!parsed.isEmpty()) {
            return parsed;
        }
        return permissoesPadraoDoRole(user);
    }

    private Map<String, NivelAcessoModulo> parseModulos(String modulesCsv) {
        Map<String, NivelAcessoModulo> result = new HashMap<>();
        if (modulesCsv == null || modulesCsv.isBlank()) {
            return result;
        }
        for (String item : modulesCsv.split(",")) {
            String trimmed = item.trim();
            if (trimmed.isEmpty()) {
                continue;
            }
            int colonIdx = trimmed.indexOf(':');
            if (colonIdx >= 0) {
                String module = trimmed.substring(0, colonIdx).trim();
                String access = trimmed.substring(colonIdx + 1).trim().toUpperCase();
                if (MODULOS.contains(module) && ("READ".equals(access) || "WRITE".equals(access))) {
                    result.put(module, NivelAcessoModulo.valueOf(access));
                } else if (("avisos".equals(module) || "informativos".equals(module)) && ("READ".equals(access) || "WRITE".equals(access))) {
                    result.put("comunicados", NivelAcessoModulo.valueOf(access));
                }
            } else if (MODULOS.contains(trimmed)) {
                result.put(trimmed, NivelAcessoModulo.WRITE);
            }
        }
        return result;
    }

    private Map<String, NivelAcessoModulo> permissoesPadraoDoRole(User user) {
        Map<String, NivelAcessoModulo> result = new HashMap<>();
        Set<String> authorities = new HashSet<>();
        user.getAuthorities().forEach(a -> authorities.add(a.getName()));

        if (authorities.stream().anyMatch(ROLES_FULL_ACCESS::contains)) {
            for (String m : MODULOS) {
                result.put(m, NivelAcessoModulo.WRITE);
            }
            return result;
        }
        if (authorities.contains(AuthoritiesConstants.SECRETARIA)) {
            for (String m : SECRETARIA_MODULES) {
                result.put(m, NivelAcessoModulo.WRITE);
            }
            return result;
        }
        if (authorities.contains(AuthoritiesConstants.TESOURARIA)) {
            for (String m : TESOURARIA_MODULES) {
                result.put(m, NivelAcessoModulo.WRITE);
            }
            return result;
        }
        if (authorities.contains(AuthoritiesConstants.LIDER)) {
            for (String m : LIDER_WRITE_MODULES) {
                result.put(m, NivelAcessoModulo.WRITE);
            }
            for (String m : LIDER_READ_MODULES) {
                result.put(m, NivelAcessoModulo.READ);
            }
            return result;
        }
        if (authorities.contains(AuthoritiesConstants.MEMBRO)) {
            for (String m : MEMBRO_READ_MODULES) {
                result.put(m, NivelAcessoModulo.READ);
            }
            for (String m : MEMBRO_WRITE_MODULES) {
                result.put(m, NivelAcessoModulo.WRITE);
            }
            return result;
        }
        if (authorities.contains(AuthoritiesConstants.VISITANTE)) {
            for (String m : VISITANTE_MODULES) {
                result.put(m, NivelAcessoModulo.READ);
            }
            return result;
        }
        return result;
    }
}
