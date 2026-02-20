package br.com.semear.web.rest;

import br.com.semear.service.GrupoLouvorService;
import br.com.semear.service.dto.GrupoLouvorDTO;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api/grupos-louvor")
@Transactional
public class GrupoLouvorResource {

    private static final Logger log = LoggerFactory.getLogger(GrupoLouvorResource.class);
    private static final String ENTITY_NAME = "grupoLouvor";

    @org.springframework.beans.factory.annotation.Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final GrupoLouvorService grupoLouvorService;

    public GrupoLouvorResource(GrupoLouvorService grupoLouvorService) {
        this.grupoLouvorService = grupoLouvorService;
    }

    @PostMapping("")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_PASTOR", "ROLE_LIDER", "ROLE_SECRETARIA"})
    public ResponseEntity<GrupoLouvorDTO> createGrupo(@Valid @RequestBody GrupoLouvorDTO dto) throws URISyntaxException {
        log.debug("REST request to create GrupoLouvor : {}", dto);
        GrupoLouvorDTO result = grupoLouvorService.save(dto);
        return ResponseEntity.created(new URI("/api/grupos-louvor/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @PutMapping("/{id}")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_PASTOR", "ROLE_LIDER", "ROLE_SECRETARIA"})
    public ResponseEntity<GrupoLouvorDTO> updateGrupo(
        @PathVariable Long id,
        @Valid @RequestBody GrupoLouvorDTO dto
    ) {
        log.debug("REST request to update GrupoLouvor : {}", id);
        dto.setId(id);
        GrupoLouvorDTO result = grupoLouvorService.update(dto);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .body(result);
    }

    @GetMapping("")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<GrupoLouvorDTO>> getAllGrupos() {
        log.debug("REST request to get all GrupoLouvor");
        List<GrupoLouvorDTO> list = grupoLouvorService.findAll();
        return ResponseEntity.ok().body(list);
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<GrupoLouvorDTO> getGrupo(@PathVariable Long id) {
        log.debug("REST request to get GrupoLouvor : {}", id);
        return ResponseUtil.wrapOrNotFound(grupoLouvorService.findOne(id));
    }

    @DeleteMapping("/{id}")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_PASTOR", "ROLE_LIDER", "ROLE_SECRETARIA"})
    public ResponseEntity<Void> deleteGrupo(@PathVariable Long id) {
        log.debug("REST request to delete GrupoLouvor : {}", id);
        grupoLouvorService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    @PostMapping("/{id}/louvores/{louvorId}")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_PASTOR", "ROLE_LIDER", "ROLE_SECRETARIA"})
    public ResponseEntity<GrupoLouvorDTO> addLouvor(@PathVariable Long id, @PathVariable Long louvorId) {
        log.debug("REST request to add louvor {} to grupo {}", louvorId, id);
        GrupoLouvorDTO result = grupoLouvorService.addLouvor(id, louvorId);
        return ResponseEntity.ok().body(result);
    }

    @DeleteMapping("/{id}/louvores/{louvorId}")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_PASTOR", "ROLE_LIDER", "ROLE_SECRETARIA"})
    public ResponseEntity<GrupoLouvorDTO> removeLouvor(@PathVariable Long id, @PathVariable Long louvorId) {
        log.debug("REST request to remove louvor {} from grupo {}", louvorId, id);
        grupoLouvorService.removeLouvor(id, louvorId);
        return ResponseUtil.wrapOrNotFound(grupoLouvorService.findOne(id));
    }

    @PutMapping("/{id}/ordem")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_PASTOR", "ROLE_LIDER", "ROLE_SECRETARIA"})
    public ResponseEntity<GrupoLouvorDTO> reorderLouvores(
        @PathVariable Long id,
        @RequestBody List<Long> louvorIdsInOrder
    ) {
        log.debug("REST request to reorder louvores in grupo {}", id);
        GrupoLouvorDTO result = grupoLouvorService.reorderLouvores(id, louvorIdsInOrder);
        return ResponseEntity.ok().body(result);
    }
}
