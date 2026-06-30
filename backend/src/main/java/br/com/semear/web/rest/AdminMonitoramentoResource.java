package br.com.semear.web.rest;

import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.AdminMonitoramentoService;
import br.com.semear.service.dto.AdminMonitoramentoDTO;
import br.com.semear.service.dto.MonitoramentoSnapshotDTO;
import jakarta.annotation.security.RolesAllowed;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/monitoramento")
public class AdminMonitoramentoResource {

    private final AdminMonitoramentoService adminMonitoramentoService;

    public AdminMonitoramentoResource(AdminMonitoramentoService adminMonitoramentoService) {
        this.adminMonitoramentoService = adminMonitoramentoService;
    }

    @GetMapping("")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN })
    public AdminMonitoramentoDTO obterMonitoramento() {
        return adminMonitoramentoService.coletar();
    }

    @GetMapping("/historico")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN })
    public List<MonitoramentoSnapshotDTO> obterHistorico(@RequestParam(defaultValue = "24") int horas) {
        return adminMonitoramentoService.obterHistorico(horas);
    }
}
