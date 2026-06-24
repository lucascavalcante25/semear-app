package br.com.semear.web.rest;

import br.com.semear.domain.enumeration.NivelAcessoModulo;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.EscalaService;
import br.com.semear.service.ModuleAccessService;
import br.com.semear.service.dto.EscalaDTO;
import br.com.semear.service.dto.EscalaItemDTO;
import jakarta.annotation.security.RolesAllowed;
import java.net.URI;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api/escalas")
public class EscalaResource {

    private final EscalaService escalaService;
    private final ModuleAccessService moduleAccessService;

    public EscalaResource(EscalaService escalaService, ModuleAccessService moduleAccessService) {
        this.escalaService = escalaService;
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
    public List<EscalaDTO> listar() {
        moduleAccessService.assertModuleAccess("escalas", NivelAcessoModulo.READ);
        return escalaService.listar();
    }

    @GetMapping("/{id}")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.MEMBRO,
    })
    public ResponseEntity<EscalaDTO> obter(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("escalas", NivelAcessoModulo.READ);
        return ResponseUtil.wrapOrNotFound(escalaService.obter(id));
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
    public ResponseEntity<EscalaDTO> criar(@RequestBody EscalaDTO dto) {
        moduleAccessService.assertModuleAccess("escalas", NivelAcessoModulo.WRITE);
        EscalaDTO result = escalaService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).location(URI.create("/api/escalas/" + result.getId())).body(result);
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
    public ResponseEntity<EscalaDTO> atualizar(@PathVariable Long id, @RequestBody EscalaDTO dto) {
        moduleAccessService.assertModuleAccess("escalas", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(escalaService.atualizar(id, dto));
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
        moduleAccessService.assertModuleAccess("escalas", NivelAcessoModulo.WRITE);
        escalaService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/itens/{itemId}/confirmar")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.MEMBRO,
    })
    public ResponseEntity<EscalaItemDTO> confirmarItem(@PathVariable Long id, @PathVariable Long itemId) {
        moduleAccessService.assertModuleAccess("escalas", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(escalaService.confirmarItem(id, itemId));
    }
}
