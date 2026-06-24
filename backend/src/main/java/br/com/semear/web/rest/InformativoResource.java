package br.com.semear.web.rest;

import br.com.semear.domain.enumeration.NivelAcessoModulo;
import br.com.semear.service.InformativoService;
import br.com.semear.service.ModuleAccessService;
import br.com.semear.service.dto.InformativoDTO;
import br.com.semear.service.dto.InformativoLeituraDTO;
import jakarta.annotation.security.RolesAllowed;
import java.net.URI;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/informativos")
public class InformativoResource {

    private final InformativoService informativoService;
    private final ModuleAccessService moduleAccessService;

    public InformativoResource(InformativoService informativoService, ModuleAccessService moduleAccessService) {
        this.informativoService = informativoService;
        this.moduleAccessService = moduleAccessService;
    }

    @PostMapping("")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA" })
    public ResponseEntity<InformativoDTO> criar(@RequestBody InformativoDTO dto) {
        moduleAccessService.assertModuleAccess("informativos", NivelAcessoModulo.WRITE);
        InformativoDTO result = informativoService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).location(URI.create("/api/informativos/" + result.getId())).body(result);
    }

    @GetMapping("")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA" })
    public List<InformativoDTO> listarAdmin() {
        moduleAccessService.assertModuleAccess("informativos", NivelAcessoModulo.READ);
        return informativoService.listarAdmin();
    }

    @GetMapping("/pendentes-login")
    public List<InformativoDTO> listarPendentesLogin() {
        moduleAccessService.assertModuleAccess("informativos", NivelAcessoModulo.READ);
        return informativoService.listarPendentesLogin();
    }

    @PostMapping("/{id}/confirmar")
    public InformativoDTO confirmar(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("informativos", NivelAcessoModulo.READ);
        return informativoService.confirmarLeitura(id);
    }

    @GetMapping("/{id}/leituras")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA" })
    public List<InformativoLeituraDTO> listarLeituras(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("informativos", NivelAcessoModulo.READ);
        return informativoService.listarLeituras(id);
    }

    @PutMapping("/{id}")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA" })
    public InformativoDTO atualizar(@PathVariable Long id, @RequestBody InformativoDTO dto) {
        moduleAccessService.assertModuleAccess("informativos", NivelAcessoModulo.WRITE);
        return informativoService.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA" })
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("informativos", NivelAcessoModulo.WRITE);
        informativoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
