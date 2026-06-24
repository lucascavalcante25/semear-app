package br.com.semear.web.rest;

import br.com.semear.domain.enumeration.NivelAcessoModulo;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.EventoService;
import br.com.semear.service.ModuleAccessService;
import br.com.semear.service.dto.EventoDTO;
import br.com.semear.service.dto.EventoInscricaoDTO;
import jakarta.annotation.security.RolesAllowed;
import java.net.URI;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api/eventos")
public class EventoResource {

    private final EventoService eventoService;
    private final ModuleAccessService moduleAccessService;

    public EventoResource(EventoService eventoService, ModuleAccessService moduleAccessService) {
        this.eventoService = eventoService;
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
    public List<EventoDTO> listar() {
        moduleAccessService.assertModuleAccess("eventos", NivelAcessoModulo.READ);
        return eventoService.listar();
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
    public ResponseEntity<EventoDTO> obter(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("eventos", NivelAcessoModulo.READ);
        return ResponseUtil.wrapOrNotFound(eventoService.obter(id));
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
    public ResponseEntity<EventoDTO> criar(@RequestBody EventoDTO dto) {
        moduleAccessService.assertModuleAccess("eventos", NivelAcessoModulo.WRITE);
        EventoDTO result = eventoService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).location(URI.create("/api/eventos/" + result.getId())).body(result);
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
    public ResponseEntity<EventoDTO> atualizar(@PathVariable Long id, @RequestBody EventoDTO dto) {
        moduleAccessService.assertModuleAccess("eventos", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(eventoService.atualizar(id, dto));
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
        moduleAccessService.assertModuleAccess("eventos", NivelAcessoModulo.WRITE);
        eventoService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/inscrever")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.MEMBRO,
    })
    public ResponseEntity<EventoInscricaoDTO> inscrever(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("eventos", NivelAcessoModulo.READ);
        return ResponseEntity.status(HttpStatus.CREATED).body(eventoService.inscrever(id));
    }

    @DeleteMapping("/{id}/inscrever")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.MEMBRO,
    })
    public ResponseEntity<Void> desinscrever(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("eventos", NivelAcessoModulo.READ);
        eventoService.desinscrever(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/inscricoes/{inscricaoId}/check-in")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
    })
    public ResponseEntity<EventoInscricaoDTO> checkIn(@PathVariable Long id, @PathVariable Long inscricaoId) {
        moduleAccessService.assertModuleAccess("eventos", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(eventoService.checkIn(id, inscricaoId));
    }
}
