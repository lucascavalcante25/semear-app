package br.com.semear.web.rest;

import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.AdminDashboardService;
import br.com.semear.service.dto.AdminDashboardDTO;
import jakarta.annotation.security.RolesAllowed;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardResource {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardResource(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping("")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN })
    public AdminDashboardDTO obterDashboard() {
        return adminDashboardService.obterEstatisticas();
    }
}
