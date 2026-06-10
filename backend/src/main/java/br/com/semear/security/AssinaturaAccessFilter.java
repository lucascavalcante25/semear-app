package br.com.semear.security;

import br.com.semear.service.AssinaturaIgrejaService;
import br.com.semear.service.TenantService;
import br.com.semear.service.dto.AssinaturaAcessoDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Bloqueia APIs da igreja quando assinatura/teste não permite acesso.
 * SUPER_ADMIN e rotas essenciais (conta, suporte, notificações) continuam liberadas.
 */
@Component
public class AssinaturaAccessFilter extends OncePerRequestFilter {

    private static final List<String> PREFIXOS_LIBERADOS = List.of(
        "/api/account",
        "/api/authenticate",
        "/api/suporte",
        "/api/notificacoes",
        "/api/public",
        "/api/admin",
        "/api/register",
        "/api/activate",
        "/api/pre-cadastros",
        "/api/solicitacoes-acesso",
        "/api/recuperacao-senha",
        "/api/igreja-configuracao/publica",
        "/api/igrejas/publicas",
        "/management/health",
        "/management/info"
    );

    private final TenantService tenantService;
    private final AssinaturaIgrejaService assinaturaIgrejaService;
    private final ObjectMapper objectMapper;

    public AssinaturaAccessFilter(
        TenantService tenantService,
        AssinaturaIgrejaService assinaturaIgrejaService,
        ObjectMapper objectMapper
    ) {
        this.tenantService = tenantService;
        this.assinaturaIgrejaService = assinaturaIgrejaService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (!path.startsWith("/api/")) {
            return true;
        }
        if (!SecurityUtils.isAuthenticated()) {
            return true;
        }
        if (SecurityUtils.hasCurrentUserAnyOfAuthorities(AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN)) {
            return true;
        }
        return PREFIXOS_LIBERADOS.stream().anyMatch(path::startsWith);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
        try {
            Long igrejaId = tenantService.getIgrejaIdAtual();
            AssinaturaAcessoDTO acesso = assinaturaIgrejaService.verificarAcesso(igrejaId);
            if (!acesso.isAcessoPermitido()) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                var body = java.util.Map.of(
                    "status",
                    403,
                    "title",
                    "Acesso temporariamente bloqueado",
                    "message",
                    acesso.getMensagem() != null
                        ? acesso.getMensagem()
                        : "O período de teste da sua igreja terminou. Entre em contato com o suporte para ativar sua assinatura.",
                    "code",
                    "assinatura.bloqueada"
                );
                objectMapper.writeValue(response.getOutputStream(), body);
                return;
            }
        } catch (Exception ex) {
            // Usuário sem igreja ou erro de tenant — não bloquear aqui (outros guards tratam)
        }
        filterChain.doFilter(request, response);
    }
}
