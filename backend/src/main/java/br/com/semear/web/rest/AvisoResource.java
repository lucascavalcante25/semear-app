package br.com.semear.web.rest;

import br.com.semear.domain.Aviso;
import br.com.semear.repository.AvisoRepository;
import br.com.semear.security.SecurityUtils;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api/avisos")
@Transactional
public class AvisoResource {

    private static final Logger LOG = LoggerFactory.getLogger(AvisoResource.class);
    private static final String ENTITY_NAME = "aviso";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final AvisoRepository avisoRepository;

    public AvisoResource(AvisoRepository avisoRepository) {
        this.avisoRepository = avisoRepository;
    }

    @PostMapping("")
    @RolesAllowed("ROLE_ADMIN")
    public ResponseEntity<Aviso> createAviso(@Valid @RequestBody Aviso aviso) throws URISyntaxException {
        LOG.debug("REST request to save Aviso : {}", aviso);
        if (aviso.getId() != null) {
            throw new BadRequestAlertException("A new aviso cannot already have an ID", ENTITY_NAME, "idexists");
        }
        if (aviso.getCriadoEm() == null) {
            aviso.setCriadoEm(Instant.now());
        }
        if (aviso.getCriadoPor() == null || aviso.getCriadoPor().isBlank()) {
            aviso.setCriadoPor(SecurityUtils.getCurrentUserLogin().orElse("system"));
        }
        Aviso result = avisoRepository.save(aviso);
        return ResponseEntity.created(new URI("/api/avisos/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @PutMapping("/{id}")
    @RolesAllowed("ROLE_ADMIN")
    public ResponseEntity<Aviso> updateAviso(@PathVariable("id") final Long id, @Valid @RequestBody Aviso aviso)
        throws URISyntaxException {
        LOG.debug("REST request to update Aviso : {}, {}", id, aviso);
        if (aviso.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, aviso.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        if (!avisoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        aviso.setAtualizadoEm(Instant.now());
        aviso.setAtualizadoPor(SecurityUtils.getCurrentUserLogin().orElse("system"));
        Aviso result = avisoRepository.save(aviso);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @GetMapping("")
    public ResponseEntity<java.util.List<Aviso>> getAllAvisos(
        @RequestParam(name = "ativos", required = false, defaultValue = "true") boolean ativos,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get a page of Avisos");
        Page<Aviso> page = ativos ? avisoRepository.findAllByAtivoIsTrue(pageable) : avisoRepository.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Aviso> getAviso(@PathVariable("id") final Long id) {
        LOG.debug("REST request to get Aviso : {}", id);
        Optional<Aviso> aviso = avisoRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(aviso);
    }

    @DeleteMapping("/{id}")
    @RolesAllowed("ROLE_ADMIN")
    public ResponseEntity<Void> deleteAviso(@PathVariable("id") final Long id) {
        LOG.debug("REST request to delete Aviso : {}", id);
        avisoRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}

