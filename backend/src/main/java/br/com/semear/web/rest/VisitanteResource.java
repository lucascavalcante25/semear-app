package br.com.semear.web.rest;

import br.com.semear.domain.Visitante;
import br.com.semear.repository.VisitanteRepository;
import br.com.semear.security.SecurityUtils;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.time.LocalDate;
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
@RequestMapping("/api/visitantes")
@Transactional
public class VisitanteResource {

    private static final Logger LOG = LoggerFactory.getLogger(VisitanteResource.class);
    private static final String ENTITY_NAME = "visitante";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final VisitanteRepository visitanteRepository;

    public VisitanteResource(VisitanteRepository visitanteRepository) {
        this.visitanteRepository = visitanteRepository;
    }

    @PostMapping("")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_SECRETARIA", "ROLE_PASTOR", "ROLE_LIDER" })
    public ResponseEntity<Visitante> createVisitante(@Valid @RequestBody Visitante visitante) throws URISyntaxException {
        LOG.debug("REST request to save Visitante : {}", visitante);
        if (visitante.getId() != null) {
            throw new BadRequestAlertException("A new visitante cannot already have an ID", ENTITY_NAME, "idexists");
        }
        if (visitante.getCriadoEm() == null) {
            visitante.setCriadoEm(Instant.now());
        }
        if (visitante.getCriadoPor() == null || visitante.getCriadoPor().isBlank()) {
            visitante.setCriadoPor(SecurityUtils.getCurrentUserLogin().orElse("system"));
        }
        if (visitante.getDataVisita() == null) {
            visitante.setDataVisita(LocalDate.now());
        }
        Visitante result = visitanteRepository.save(visitante);
        return ResponseEntity.created(new URI("/api/visitantes/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @PutMapping("/{id}")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_SECRETARIA", "ROLE_PASTOR", "ROLE_LIDER" })
    public ResponseEntity<Visitante> updateVisitante(
        @PathVariable("id") final Long id,
        @Valid @RequestBody Visitante visitante
    ) throws URISyntaxException {
        LOG.debug("REST request to update Visitante : {}, {}", id, visitante);
        if (visitante.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, visitante.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        if (!visitanteRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        visitante.setAtualizadoEm(Instant.now());
        visitante.setAtualizadoPor(SecurityUtils.getCurrentUserLogin().orElse("system"));
        Visitante result = visitanteRepository.save(visitante);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @GetMapping("")
    public ResponseEntity<java.util.List<Visitante>> getAllVisitantes(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of Visitantes");
        Page<Visitante> page = visitanteRepository.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Visitante> getVisitante(@PathVariable("id") final Long id) {
        LOG.debug("REST request to get Visitante : {}", id);
        Optional<Visitante> visitante = visitanteRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(visitante);
    }

    @DeleteMapping("/{id}")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_SECRETARIA", "ROLE_PASTOR", "ROLE_LIDER" })
    public ResponseEntity<Void> deleteVisitante(@PathVariable("id") final Long id) {
        LOG.debug("REST request to delete Visitante : {}", id);
        visitanteRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}

