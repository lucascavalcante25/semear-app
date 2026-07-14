package br.com.semear.web.rest;

import br.com.semear.domain.enumeration.NivelAcessoModulo;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.DepartamentoService;
import br.com.semear.service.ModuleAccessService;
import br.com.semear.service.dto.DepartamentoDTO;
import br.com.semear.service.dto.DepartamentoMembroDTO;
import jakarta.annotation.security.RolesAllowed;
import java.net.URI;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api/departamentos")
public class DepartamentoResource {

    private final DepartamentoService departamentoService;
    private final ModuleAccessService moduleAccessService;

    public DepartamentoResource(DepartamentoService departamentoService, ModuleAccessService moduleAccessService) {
        this.departamentoService = departamentoService;
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
    public List<DepartamentoDTO> listar(@RequestParam(name = "resumo", defaultValue = "false") boolean resumo) {
        moduleAccessService.assertModuleAccess("departamentos", NivelAcessoModulo.READ);
        return resumo ? departamentoService.listarResumo() : departamentoService.listar();
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
    public ResponseEntity<DepartamentoDTO> obter(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("departamentos", NivelAcessoModulo.READ);
        return ResponseUtil.wrapOrNotFound(departamentoService.obter(id));
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
    public ResponseEntity<DepartamentoDTO> criar(@RequestBody DepartamentoDTO dto) {
        moduleAccessService.assertModuleAccess("departamentos", NivelAcessoModulo.WRITE);
        DepartamentoDTO result = departamentoService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).location(URI.create("/api/departamentos/" + result.getId())).body(result);
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
    public ResponseEntity<DepartamentoDTO> atualizar(@PathVariable Long id, @RequestBody DepartamentoDTO dto) {
        moduleAccessService.assertModuleAccess("departamentos", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(departamentoService.atualizar(id, dto));
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
        moduleAccessService.assertModuleAccess("departamentos", NivelAcessoModulo.WRITE);
        departamentoService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/membros")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
    })
    public ResponseEntity<DepartamentoMembroDTO> adicionarMembro(@PathVariable Long id, @RequestBody DepartamentoMembroDTO dto) {
        moduleAccessService.assertModuleAccess("departamentos", NivelAcessoModulo.WRITE);
        return ResponseEntity.status(HttpStatus.CREATED).body(departamentoService.adicionarMembro(id, dto));
    }

    @DeleteMapping("/{id}/membros/{userId}")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
    })
    public ResponseEntity<Void> removerMembro(@PathVariable Long id, @PathVariable Long userId) {
        moduleAccessService.assertModuleAccess("departamentos", NivelAcessoModulo.WRITE);
        departamentoService.removerMembro(id, userId);
        return ResponseEntity.noContent().build();
    }
}
