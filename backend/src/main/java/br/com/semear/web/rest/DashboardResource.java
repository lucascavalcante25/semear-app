package br.com.semear.web.rest;

import br.com.semear.domain.enumeration.NivelAcessoModulo;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.DashboardService;
import br.com.semear.service.ModuleAccessService;
import br.com.semear.service.dto.DashboardResumoDTO;
import jakarta.annotation.security.RolesAllowed;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardResource {

    private final DashboardService dashboardService;
    private final ModuleAccessService moduleAccessService;

    public DashboardResource(DashboardService dashboardService, ModuleAccessService moduleAccessService) {
        this.dashboardService = dashboardService;
        this.moduleAccessService = moduleAccessService;
    }

    @GetMapping("/resumo")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.TESOURARIA,
        AuthoritiesConstants.MEMBRO,
        AuthoritiesConstants.VISITANTE,
    })
    public DashboardResumoDTO obterResumo() {
        moduleAccessService.assertModuleAccess("dashboard", NivelAcessoModulo.READ);
        return dashboardService.obterResumo();
    }
}
