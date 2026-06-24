package br.com.semear.web.rest;

import br.com.semear.domain.enumeration.NivelAcessoModulo;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.AcompanhamentoPastoralService;
import br.com.semear.service.ModuleAccessService;
import br.com.semear.service.dto.AcompanhamentoPastoralDTO;
import jakarta.annotation.security.RolesAllowed;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api/acompanhamentos-pastorais")
public class AcompanhamentoPastoralResource {

    private final AcompanhamentoPastoralService service;
    private final ModuleAccessService moduleAccessService;

    public AcompanhamentoPastoralResource(AcompanhamentoPastoralService service, ModuleAccessService moduleAccessService) {
        this.service = service;
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
        AuthoritiesConstants.MEMBRO,
    })
    public List<AcompanhamentoPastoralDTO> listar() {
        moduleAccessService.assertModuleAccess("acompanhamento-pastoral", NivelAcessoModulo.READ);
        return service.listar();
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
    public ResponseEntity<AcompanhamentoPastoralDTO> obter(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("acompanhamento-pastoral", NivelAcessoModulo.READ);
        return ResponseUtil.wrapOrNotFound(service.obter(id));
    }

    @PostMapping("")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.MEMBRO,
    })
    public ResponseEntity<AcompanhamentoPastoralDTO> criar(@RequestBody AcompanhamentoPastoralDTO dto) {
        moduleAccessService.assertModuleAccess("acompanhamento-pastoral", NivelAcessoModulo.WRITE);
        AcompanhamentoPastoralDTO result = service.criar(dto);
        return ResponseEntity.created(URI.create("/api/acompanhamentos-pastorais/" + result.getId())).body(result);
    }

    @PutMapping("/{id}")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.MEMBRO,
    })
    public ResponseEntity<AcompanhamentoPastoralDTO> atualizar(@PathVariable Long id, @RequestBody AcompanhamentoPastoralDTO dto) {
        moduleAccessService.assertModuleAccess("acompanhamento-pastoral", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(service.atualizar(id, dto));
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
        moduleAccessService.assertModuleAccess("acompanhamento-pastoral", NivelAcessoModulo.WRITE);
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
