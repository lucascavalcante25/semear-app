package br.com.semear.web.rest;

import br.com.semear.service.LouvorService;
import br.com.semear.service.dto.LouvorDTO;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller para gerenciar Louvores.
 */
@RestController
@RequestMapping("/api/louvores")
@Transactional
public class LouvorResource {

    private static final Logger log = LoggerFactory.getLogger(LouvorResource.class);
    private static final String ENTITY_NAME = "louvor";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final LouvorService louvorService;

    public LouvorResource(LouvorService louvorService) {
        this.louvorService = louvorService;
    }

    @PostMapping("")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_PASTOR", "ROLE_LIDER", "ROLE_SECRETARIA"})
    public ResponseEntity<LouvorDTO> createLouvor(@Valid @RequestBody LouvorDTO louvorDTO) throws URISyntaxException {
        log.debug("REST request to create Louvor : {}", louvorDTO);
        if (louvorDTO.getId() != null) {
            throw new BadRequestAlertException("A new louvor cannot already have an ID", ENTITY_NAME, "idexists");
        }
        LouvorDTO result = louvorService.save(louvorDTO);
        return ResponseEntity.created(new URI("/api/louvores/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * Cria louvor com cifra em anexo (multipart/form-data).
     */
    @PostMapping(value = "/com-cifra", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RolesAllowed({"ROLE_ADMIN", "ROLE_PASTOR", "ROLE_LIDER", "ROLE_SECRETARIA"})
    public ResponseEntity<LouvorDTO> createLouvorWithCifra(
        @RequestPart("louvor") @Valid LouvorDTO louvorDTO,
        @RequestPart(value = "cifra", required = false) MultipartFile cifraFile
    ) throws URISyntaxException {
        log.debug("REST request to create Louvor with cifra");
        if (louvorDTO.getId() != null) {
            throw new BadRequestAlertException("A new louvor cannot already have an ID", ENTITY_NAME, "idexists");
        }
        LouvorDTO result = louvorService.saveWithCifra(louvorDTO, cifraFile);
        return ResponseEntity.created(new URI("/api/louvores/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @PutMapping("/{id}")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_PASTOR", "ROLE_LIDER", "ROLE_SECRETARIA"})
    public ResponseEntity<LouvorDTO> updateLouvor(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody LouvorDTO louvorDTO
    ) throws URISyntaxException {
        log.debug("REST request to update Louvor : {}, {}", id, louvorDTO);
        if (louvorDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, louvorDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        Optional<LouvorDTO> existing = louvorService.findOne(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        LouvorDTO result = louvorService.save(louvorDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * Atualiza apenas a cifra do louvor.
     */
    @PutMapping(value = "/{id}/cifra", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RolesAllowed({"ROLE_ADMIN", "ROLE_PASTOR", "ROLE_LIDER", "ROLE_SECRETARIA"})
    public ResponseEntity<LouvorDTO> updateCifra(
        @PathVariable Long id,
        @RequestPart("cifra") MultipartFile cifraFile
    ) {
        log.debug("REST request to update cifra for Louvor : {}", id);
        LouvorDTO result = louvorService.updateCifra(id, cifraFile);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .body(result);
    }

    @GetMapping("")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<LouvorDTO>> getAllLouvores(
        @RequestParam(required = false) String q
    ) {
        log.debug("REST request to get Louvores");
        List<LouvorDTO> list = q != null && !q.isBlank()
            ? louvorService.search(q.trim())
            : louvorService.findAll();
        return ResponseEntity.ok().body(list);
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<LouvorDTO> getLouvor(@PathVariable Long id) {
        log.debug("REST request to get Louvor : {}", id);
        Optional<LouvorDTO> louvorDTO = louvorService.findOne(id);
        return ResponseUtil.wrapOrNotFound(louvorDTO);
    }

    /**
     * Download ou visualização da cifra (PDF/Word).
     */
    @GetMapping("/{id}/cifra")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> getCifra(@PathVariable Long id) {
        log.debug("REST request to get cifra for Louvor : {}", id);
        Optional<byte[]> bytes = louvorService.getCifraBytes(id);
        if (bytes.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Optional<LouvorDTO> louvor = louvorService.findOne(id);
        String contentType = louvor
            .map(LouvorDTO::getCifraContentType)
            .filter(ct -> ct != null && !ct.isBlank())
            .orElse("application/octet-stream");
        String filename = louvor
            .map(LouvorDTO::getCifraFileName)
            .filter(f -> f != null && !f.isBlank())
            .orElse("cifra.pdf");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.setContentDispositionFormData("inline", filename);

        return ResponseEntity.ok()
            .headers(headers)
            .body(bytes.get());
    }

    @DeleteMapping("/{id}")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_PASTOR", "ROLE_LIDER", "ROLE_SECRETARIA"})
    public ResponseEntity<Void> deleteLouvor(@PathVariable Long id) {
        log.debug("REST request to delete Louvor : {}", id);
        louvorService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
