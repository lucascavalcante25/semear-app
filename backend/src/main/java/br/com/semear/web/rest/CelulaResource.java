package br.com.semear.web.rest;

import br.com.semear.domain.enumeration.NivelAcessoModulo;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.CelulaRelatorioService;
import br.com.semear.service.CelulaService;
import br.com.semear.service.ModuleAccessService;
import br.com.semear.service.dto.CelulaDTO;
import br.com.semear.service.dto.CelulaMembroDTO;
import br.com.semear.service.dto.CelulaRelatorioDTO;
import jakarta.annotation.security.RolesAllowed;
import java.net.URI;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api/celulas")
public class CelulaResource {

    private final CelulaService celulaService;
    private final CelulaRelatorioService celulaRelatorioService;
    private final ModuleAccessService moduleAccessService;

    public CelulaResource(
        CelulaService celulaService,
        CelulaRelatorioService celulaRelatorioService,
        ModuleAccessService moduleAccessService
    ) {
        this.celulaService = celulaService;
        this.celulaRelatorioService = celulaRelatorioService;
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
    public List<CelulaDTO> listar() {
        moduleAccessService.assertModuleAccess("celulas", NivelAcessoModulo.READ);
        return celulaService.listar();
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
    public ResponseEntity<CelulaDTO> obter(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("celulas", NivelAcessoModulo.READ);
        return ResponseUtil.wrapOrNotFound(celulaService.obter(id));
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
    public ResponseEntity<CelulaDTO> criar(@RequestBody CelulaDTO dto) {
        moduleAccessService.assertModuleAccess("celulas", NivelAcessoModulo.WRITE);
        CelulaDTO result = celulaService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).location(URI.create("/api/celulas/" + result.getId())).body(result);
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
    public ResponseEntity<CelulaDTO> atualizar(@PathVariable Long id, @RequestBody CelulaDTO dto) {
        moduleAccessService.assertModuleAccess("celulas", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(celulaService.atualizar(id, dto));
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
        moduleAccessService.assertModuleAccess("celulas", NivelAcessoModulo.WRITE);
        celulaService.excluir(id);
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
    public ResponseEntity<CelulaMembroDTO> adicionarMembro(@PathVariable Long id, @RequestBody CelulaMembroDTO dto) {
        moduleAccessService.assertModuleAccess("celulas", NivelAcessoModulo.WRITE);
        return ResponseEntity.status(HttpStatus.CREATED).body(celulaService.adicionarMembro(id, dto));
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
        moduleAccessService.assertModuleAccess("celulas", NivelAcessoModulo.WRITE);
        celulaService.removerMembro(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/relatorios")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
    })
    public List<CelulaRelatorioDTO> listarRelatorios(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("celulas", NivelAcessoModulo.READ);
        return celulaRelatorioService.listar(id);
    }

    @PostMapping("/{id}/relatorios")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
    })
    public ResponseEntity<CelulaRelatorioDTO> criarRelatorio(@PathVariable Long id, @RequestBody CelulaRelatorioDTO dto) {
        moduleAccessService.assertModuleAccess("celulas", NivelAcessoModulo.WRITE);
        CelulaRelatorioDTO result = celulaRelatorioService.criar(id, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }
}
