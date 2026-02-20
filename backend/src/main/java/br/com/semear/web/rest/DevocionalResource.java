package br.com.semear.web.rest;

import br.com.semear.service.DevocionalService;
import br.com.semear.service.dto.DevocionalDTO;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing Devocional.
 * 
 * PERMISSÕES:
 * - GET: Público (sem autenticação) - todos podem ler
 * - POST/PUT/DELETE: Apenas ADMIN - controle de qualidade
 * 
 * PADRÃO: 1 devocional/dia para leitura diária (Daily Devotional)
 */
@RestController
@RequestMapping("/api/devocionais")
@Transactional
public class DevocionalResource {

    private final Logger log = LoggerFactory.getLogger(DevocionalResource.class);

    private static final String ENTITY_NAME = "devocional";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final DevocionalService devocionalService;

    public DevocionalResource(DevocionalService devocionalService) {
        this.devocionalService = devocionalService;
    }

    @PostMapping("")
    @RolesAllowed("ROLE_ADMIN")
    public ResponseEntity<DevocionalDTO> createDevocional(@Valid @RequestBody DevocionalDTO devocionalDTO) throws URISyntaxException {
        log.debug("REST request to save Devocional : {}", devocionalDTO);
        if (devocionalDTO.getId() != null) {
            throw new BadRequestAlertException("A new devocional cannot already have an ID", ENTITY_NAME, "idexists");
        }
        DevocionalDTO result = devocionalService.save(devocionalDTO);
        return ResponseEntity.created(new URI("/api/devocionais/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @PutMapping("/{id}")
    @RolesAllowed("ROLE_ADMIN")
    public ResponseEntity<DevocionalDTO> updateDevocional(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody DevocionalDTO devocionalDTO
    ) throws URISyntaxException {
        log.debug("REST request to update Devocional : {}, {}", id, devocionalDTO);
        if (devocionalDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, devocionalDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        // Ensure exists
        Optional<DevocionalDTO> existing = devocionalService.findOne(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        DevocionalDTO result = devocionalService.save(devocionalDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @GetMapping("")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<DevocionalDTO>> getAllDevocionais(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        log.debug("REST request to get a page of Devocionais");
        Page<DevocionalDTO> page = devocionalService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /devocionais/hoje} : Devocional do dia (data atual).
     */
    @GetMapping("/hoje")
    @PreAuthorize("permitAll()")
    public ResponseEntity<DevocionalDTO> getDevocionalHoje() {
        log.debug("REST request to get Devocional do dia");
        LocalDate hoje = LocalDate.now();
        return devocionalService.findHoje(hoje)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<DevocionalDTO> getDevocional(@PathVariable("id") Long id) {
        log.debug("REST request to get Devocional : {}", id);
        Optional<DevocionalDTO> devocionalDTO = devocionalService.findOne(id);
        return ResponseUtil.wrapOrNotFound(devocionalDTO);
    }

    @DeleteMapping("/{id}")
    @RolesAllowed("ROLE_ADMIN")
    public ResponseEntity<Void> deleteDevocional(@PathVariable("id") Long id) {
        log.debug("REST request to delete Devocional : {}", id);
        devocionalService.delete(id);
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString())).build();
    }
}
