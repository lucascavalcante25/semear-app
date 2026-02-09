package br.com.semear.web.rest;

import br.com.semear.domain.DiaPlanoLeitura;
import br.com.semear.repository.DiaPlanoLeituraRepository;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link br.com.semear.domain.DiaPlanoLeitura}.
 */
@RestController
@RequestMapping("/api/dia-plano-leituras")
@Transactional
public class DiaPlanoLeituraResource {

    private static final Logger LOG = LoggerFactory.getLogger(DiaPlanoLeituraResource.class);

    private static final String ENTITY_NAME = "diaPlanoLeitura";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final DiaPlanoLeituraRepository diaPlanoLeituraRepository;

    public DiaPlanoLeituraResource(DiaPlanoLeituraRepository diaPlanoLeituraRepository) {
        this.diaPlanoLeituraRepository = diaPlanoLeituraRepository;
    }

    /**
     * {@code POST  /dia-plano-leituras} : Create a new diaPlanoLeitura.
     *
     * @param diaPlanoLeitura the diaPlanoLeitura to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new diaPlanoLeitura, or with status {@code 400 (Bad Request)} if the diaPlanoLeitura has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<DiaPlanoLeitura> createDiaPlanoLeitura(@Valid @RequestBody DiaPlanoLeitura diaPlanoLeitura)
        throws URISyntaxException {
        LOG.debug("REST request to save DiaPlanoLeitura : {}", diaPlanoLeitura);
        if (diaPlanoLeitura.getId() != null) {
            throw new BadRequestAlertException("A new diaPlanoLeitura cannot already have an ID", ENTITY_NAME, "idexists");
        }
        diaPlanoLeitura = diaPlanoLeituraRepository.save(diaPlanoLeitura);
        return ResponseEntity.created(new URI("/api/dia-plano-leituras/" + diaPlanoLeitura.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, diaPlanoLeitura.getId().toString()))
            .body(diaPlanoLeitura);
    }

    /**
     * {@code PUT  /dia-plano-leituras/:id} : Updates an existing diaPlanoLeitura.
     *
     * @param id the id of the diaPlanoLeitura to save.
     * @param diaPlanoLeitura the diaPlanoLeitura to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated diaPlanoLeitura,
     * or with status {@code 400 (Bad Request)} if the diaPlanoLeitura is not valid,
     * or with status {@code 500 (Internal Server Error)} if the diaPlanoLeitura couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<DiaPlanoLeitura> updateDiaPlanoLeitura(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody DiaPlanoLeitura diaPlanoLeitura
    ) throws URISyntaxException {
        LOG.debug("REST request to update DiaPlanoLeitura : {}, {}", id, diaPlanoLeitura);
        if (diaPlanoLeitura.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, diaPlanoLeitura.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!diaPlanoLeituraRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        diaPlanoLeitura = diaPlanoLeituraRepository.save(diaPlanoLeitura);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, diaPlanoLeitura.getId().toString()))
            .body(diaPlanoLeitura);
    }

    /**
     * {@code PATCH  /dia-plano-leituras/:id} : Partial updates given fields of an existing diaPlanoLeitura, field will ignore if it is null
     *
     * @param id the id of the diaPlanoLeitura to save.
     * @param diaPlanoLeitura the diaPlanoLeitura to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated diaPlanoLeitura,
     * or with status {@code 400 (Bad Request)} if the diaPlanoLeitura is not valid,
     * or with status {@code 404 (Not Found)} if the diaPlanoLeitura is not found,
     * or with status {@code 500 (Internal Server Error)} if the diaPlanoLeitura couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<DiaPlanoLeitura> partialUpdateDiaPlanoLeitura(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody DiaPlanoLeitura diaPlanoLeitura
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update DiaPlanoLeitura partially : {}, {}", id, diaPlanoLeitura);
        if (diaPlanoLeitura.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, diaPlanoLeitura.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!diaPlanoLeituraRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<DiaPlanoLeitura> result = diaPlanoLeituraRepository
            .findById(diaPlanoLeitura.getId())
            .map(existingDiaPlanoLeitura -> {
                if (diaPlanoLeitura.getNumeroDia() != null) {
                    existingDiaPlanoLeitura.setNumeroDia(diaPlanoLeitura.getNumeroDia());
                }
                if (diaPlanoLeitura.getTitulo() != null) {
                    existingDiaPlanoLeitura.setTitulo(diaPlanoLeitura.getTitulo());
                }
                if (diaPlanoLeitura.getLeiturasJson() != null) {
                    existingDiaPlanoLeitura.setLeiturasJson(diaPlanoLeitura.getLeiturasJson());
                }

                return existingDiaPlanoLeitura;
            })
            .map(diaPlanoLeituraRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, diaPlanoLeitura.getId().toString())
        );
    }

    /**
     * {@code GET  /dia-plano-leituras} : get all the diaPlanoLeituras.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of diaPlanoLeituras in body.
     */
    @GetMapping("")
    public ResponseEntity<List<DiaPlanoLeitura>> getAllDiaPlanoLeituras(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of DiaPlanoLeituras");
        Page<DiaPlanoLeitura> page = diaPlanoLeituraRepository.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /dia-plano-leituras/:id} : get the "id" diaPlanoLeitura.
     *
     * @param id the id of the diaPlanoLeitura to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the diaPlanoLeitura, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<DiaPlanoLeitura> getDiaPlanoLeitura(@PathVariable("id") Long id) {
        LOG.debug("REST request to get DiaPlanoLeitura : {}", id);
        Optional<DiaPlanoLeitura> diaPlanoLeitura = diaPlanoLeituraRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(diaPlanoLeitura);
    }

    /**
     * {@code DELETE  /dia-plano-leituras/:id} : delete the "id" diaPlanoLeitura.
     *
     * @param id the id of the diaPlanoLeitura to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiaPlanoLeitura(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete DiaPlanoLeitura : {}", id);
        diaPlanoLeituraRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
