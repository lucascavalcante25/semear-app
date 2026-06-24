package br.com.semear.web.rest;

import br.com.semear.domain.enumeration.NivelAcessoModulo;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.CriancaService;
import br.com.semear.service.ModuleAccessService;
import br.com.semear.service.dto.CriancaDTO;
import jakarta.annotation.security.RolesAllowed;
import java.net.URI;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api/criancas")
public class CriancaResource {

    private final CriancaService criancaService;
    private final ModuleAccessService moduleAccessService;

    public CriancaResource(CriancaService criancaService, ModuleAccessService moduleAccessService) {
        this.criancaService = criancaService;
        this.moduleAccessService = moduleAccessService;
    }

    @GetMapping("")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
    })
    public List<CriancaDTO> listar() {
        moduleAccessService.assertModuleAccess("criancas", NivelAcessoModulo.READ);
        return criancaService.listar();
    }

    @GetMapping("/{id}")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
    })
    public ResponseEntity<CriancaDTO> obter(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("criancas", NivelAcessoModulo.READ);
        return ResponseUtil.wrapOrNotFound(criancaService.obter(id));
    }

    @PostMapping("")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
    })
    public ResponseEntity<CriancaDTO> criar(@RequestBody CriancaDTO dto) {
        moduleAccessService.assertModuleAccess("criancas", NivelAcessoModulo.WRITE);
        CriancaDTO result = criancaService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).location(URI.create("/api/criancas/" + result.getId())).body(result);
    }

    @PutMapping("/{id}")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
    })
    public ResponseEntity<CriancaDTO> atualizar(@PathVariable Long id, @RequestBody CriancaDTO dto) {
        moduleAccessService.assertModuleAccess("criancas", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(criancaService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
    })
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("criancas", NivelAcessoModulo.WRITE);
        criancaService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/check-in")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
    })
    public ResponseEntity<CriancaDTO> checkIn(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("criancas", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(criancaService.registrarCheckIn(id));
    }

    @PatchMapping("/{id}/check-out")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
    })
    public ResponseEntity<CriancaDTO> checkOut(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("criancas", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(criancaService.registrarCheckOut(id));
    }
}
