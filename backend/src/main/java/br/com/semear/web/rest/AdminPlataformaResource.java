package br.com.semear.web.rest;

import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.AdminPlataformaService;
import br.com.semear.service.dto.AdminUsuarioResumoDTO;
import br.com.semear.service.dto.AssinaturaIgrejaDTO;
import br.com.semear.service.dto.FinanceiroPlataformaResumoDTO;
import br.com.semear.service.dto.PlanoDTO;
import br.com.semear.service.dto.PlataformaConfigDTO;
import jakarta.annotation.security.RolesAllowed;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminPlataformaResource {

    private static final Logger LOG = LoggerFactory.getLogger(AdminPlataformaResource.class);

    private final AdminPlataformaService adminPlataformaService;

    public AdminPlataformaResource(AdminPlataformaService adminPlataformaService) {
        this.adminPlataformaService = adminPlataformaService;
    }

    @GetMapping("/usuarios")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN })
    public List<AdminUsuarioResumoDTO> listarUsuarios() {
        LOG.debug("REST request to list all platform users");
        return adminPlataformaService.listarUsuarios();
    }

    @GetMapping("/planos")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN })
    public List<PlanoDTO> listarPlanos() {
        LOG.debug("REST request to list platform plans");
        return adminPlataformaService.listarPlanos();
    }

    @GetMapping("/assinaturas")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN })
    public List<AssinaturaIgrejaDTO> listarAssinaturas() {
        LOG.debug("REST request to list church subscriptions");
        return adminPlataformaService.listarAssinaturas();
    }

    @GetMapping("/financeiro/resumo")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN })
    public FinanceiroPlataformaResumoDTO resumoFinanceiro() {
        LOG.debug("REST request to get platform financial summary");
        return adminPlataformaService.obterResumoFinanceiro();
    }

    @GetMapping("/configuracao-plataforma")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN })
    public PlataformaConfigDTO configuracaoPlataforma() {
        LOG.debug("REST request to get platform configuration");
        return adminPlataformaService.obterConfiguracao();
    }
}
