package br.com.semear.web.rest;

import br.com.semear.domain.enumeration.FormaPagamentoPlataforma;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.AssinaturaIgrejaService;
import br.com.semear.service.dto.AssinaturaIgrejaDTO;
import br.com.semear.service.dto.AtualizarAssinaturaDTO;
import br.com.semear.service.dto.ProrrogarTesteDTO;
import br.com.semear.service.dto.SuspenderAssinaturaDTO;
import jakarta.annotation.security.RolesAllowed;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/assinaturas")
public class AdminAssinaturaResource {

    private static final Logger LOG = LoggerFactory.getLogger(AdminAssinaturaResource.class);

    private final AssinaturaIgrejaService assinaturaIgrejaService;

    public AdminAssinaturaResource(AssinaturaIgrejaService assinaturaIgrejaService) {
        this.assinaturaIgrejaService = assinaturaIgrejaService;
    }

    @GetMapping
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN })
    public List<AssinaturaIgrejaDTO> listar() {
        LOG.debug("REST request to list subscriptions");
        return assinaturaIgrejaService.listarTodas();
    }

    @GetMapping("/{id}")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN })
    public AssinaturaIgrejaDTO buscar(@PathVariable Long id) {
        return assinaturaIgrejaService
            .listarTodas()
            .stream()
            .filter(a -> a.getId().equals(id))
            .findFirst()
            .orElseThrow();
    }

    @PatchMapping("/{id}/ativar")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN })
    public AssinaturaIgrejaDTO ativar(@PathVariable Long id) {
        return assinaturaIgrejaService.ativar(id);
    }

    @PatchMapping("/{id}/prorrogar-teste")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN })
    public AssinaturaIgrejaDTO prorrogarTeste(@PathVariable Long id, @RequestBody(required = false) ProrrogarTesteDTO dto) {
        int dias = dto != null && dto.getDias() != null ? dto.getDias() : 7;
        return assinaturaIgrejaService.prorrogarTeste(id, dias);
    }

    @PatchMapping("/{id}/suspender")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN })
    public AssinaturaIgrejaDTO suspender(@PathVariable Long id, @RequestBody(required = false) SuspenderAssinaturaDTO dto) {
        return assinaturaIgrejaService.suspender(id, dto != null ? dto.getMotivo() : null);
    }

    @PatchMapping("/{id}/reativar")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN })
    public AssinaturaIgrejaDTO reativar(@PathVariable Long id) {
        return assinaturaIgrejaService.reativar(id);
    }

    @PatchMapping("/{id}/cancelar")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN })
    public AssinaturaIgrejaDTO cancelar(@PathVariable Long id) {
        return assinaturaIgrejaService.cancelar(id);
    }

    @PatchMapping("/{id}/registrar-pagamento-implantacao")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN })
    public AssinaturaIgrejaDTO registrarImplantacao(@PathVariable Long id, @RequestBody(required = false) AtualizarAssinaturaDTO dto) {
        FormaPagamentoPlataforma forma = dto != null ? dto.getFormaPagamento() : FormaPagamentoPlataforma.PIX;
        return assinaturaIgrejaService.marcarImplantacaoPaga(id, forma != null ? forma : FormaPagamentoPlataforma.PIX);
    }

    @PatchMapping("/{id}/registrar-pagamento-mensal")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN })
    public AssinaturaIgrejaDTO registrarMensal(@PathVariable Long id, @RequestBody(required = false) AtualizarAssinaturaDTO dto) {
        FormaPagamentoPlataforma forma = dto != null ? dto.getFormaPagamento() : FormaPagamentoPlataforma.PIX;
        return assinaturaIgrejaService.marcarMensalidadePaga(id, forma != null ? forma : FormaPagamentoPlataforma.PIX);
    }

    @PatchMapping("/{id}/registrar-pagamento-anual")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN })
    public AssinaturaIgrejaDTO registrarAnual(@PathVariable Long id, @RequestBody(required = false) AtualizarAssinaturaDTO dto) {
        FormaPagamentoPlataforma forma = dto != null ? dto.getFormaPagamento() : FormaPagamentoPlataforma.PIX;
        return assinaturaIgrejaService.registrarPagamentoAnual(id, forma != null ? forma : FormaPagamentoPlataforma.PIX);
    }

    @PutMapping("/{id}")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN })
    public AssinaturaIgrejaDTO atualizar(@PathVariable Long id, @RequestBody AtualizarAssinaturaDTO dto) {
        if (dto.getObservacao() != null) {
            assinaturaIgrejaService.atualizarObservacao(id, dto.getObservacao());
        }
        if (dto.getProximoVencimento() != null) {
            return assinaturaIgrejaService.atualizarVencimento(id, dto.getProximoVencimento());
        }
        return assinaturaIgrejaService
            .listarTodas()
            .stream()
            .filter(a -> a.getId().equals(id))
            .findFirst()
            .orElseThrow();
    }
}
