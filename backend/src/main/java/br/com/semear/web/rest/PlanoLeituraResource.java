package br.com.semear.web.rest;

import br.com.semear.domain.PlanoLeitura;
import br.com.semear.repository.PlanoLeituraRepository;
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
 * REST controller for managing {@link br.com.semear.domain.PlanoLeitura}.
 */
@RestController
@RequestMapping("/api/plano-leituras")
@Transactional
public class PlanoLeituraResource {

    private static final Logger LOG = LoggerFactory.getLogger(PlanoLeituraResource.class);

    private static final String ENTITY_NAME = "planoLeitura";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final PlanoLeituraRepository planoLeituraRepository;

    public PlanoLeituraResource(PlanoLeituraRepository planoLeituraRepository) {
        this.planoLeituraRepository = planoLeituraRepository;
    }

    /**
     * {@code POST  /plano-leituras} : Create a new planoLeitura.
     *
     * @param planoLeitura the planoLeitura to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new planoLeitura, or with status {@code 400 (Bad Request)} if the planoLeitura has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<PlanoLeitura> createPlanoLeitura(@Valid @RequestBody PlanoLeitura planoLeitura) throws URISyntaxException {
        LOG.debug("REST request to save PlanoLeitura : {}", planoLeitura);
        if (planoLeitura.getId() != null) {
            throw new BadRequestAlertException("A new planoLeitura cannot already have an ID", ENTITY_NAME, "idexists");
        }
        planoLeitura = planoLeituraRepository.save(planoLeitura);
        return ResponseEntity.created(new URI("/api/plano-leituras/" + planoLeitura.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, planoLeitura.getId().toString()))
            .body(planoLeitura);
    }

    /**
     * {@code PUT  /plano-leituras/:id} : Updates an existing planoLeitura.
     *
     * @param id the id of the planoLeitura to save.
     * @param planoLeitura the planoLeitura to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated planoLeitura,
     * or with status {@code 400 (Bad Request)} if the planoLeitura is not valid,
     * or with status {@code 500 (Internal Server Error)} if the planoLeitura couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<PlanoLeitura> updatePlanoLeitura(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody PlanoLeitura planoLeitura
    ) throws URISyntaxException {
        LOG.debug("REST request to update PlanoLeitura : {}, {}", id, planoLeitura);
        if (planoLeitura.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, planoLeitura.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!planoLeituraRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        planoLeitura = planoLeituraRepository.save(planoLeitura);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, planoLeitura.getId().toString()))
            .body(planoLeitura);
    }

    /**
     * {@code PATCH  /plano-leituras/:id} : Partial updates given fields of an existing planoLeitura, field will ignore if it is null
     *
     * @param id the id of the planoLeitura to save.
     * @param planoLeitura the planoLeitura to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated planoLeitura,
     * or with status {@code 400 (Bad Request)} if the planoLeitura is not valid,
     * or with status {@code 404 (Not Found)} if the planoLeitura is not found,
     * or with status {@code 500 (Internal Server Error)} if the planoLeitura couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<PlanoLeitura> partialUpdatePlanoLeitura(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody PlanoLeitura planoLeitura
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update PlanoLeitura partially : {}, {}", id, planoLeitura);
        if (planoLeitura.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, planoLeitura.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!planoLeituraRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<PlanoLeitura> result = planoLeituraRepository
            .findById(planoLeitura.getId())
            .map(existingPlanoLeitura -> {
                if (planoLeitura.getNome() != null) {
                    existingPlanoLeitura.setNome(planoLeitura.getNome());
                }
                if (planoLeitura.getDescricao() != null) {
                    existingPlanoLeitura.setDescricao(planoLeitura.getDescricao());
                }
                if (planoLeitura.getTipo() != null) {
                    existingPlanoLeitura.setTipo(planoLeitura.getTipo());
                }
                if (planoLeitura.getAtivo() != null) {
                    existingPlanoLeitura.setAtivo(planoLeitura.getAtivo());
                }
                if (planoLeitura.getCriadoEm() != null) {
                    existingPlanoLeitura.setCriadoEm(planoLeitura.getCriadoEm());
                }
                if (planoLeitura.getAtualizadoEm() != null) {
                    existingPlanoLeitura.setAtualizadoEm(planoLeitura.getAtualizadoEm());
                }

                return existingPlanoLeitura;
            })
            .map(planoLeituraRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, planoLeitura.getId().toString())
        );
    }

    /**
     * {@code GET  /plano-leituras} : get all the planoLeituras.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of planoLeituras in body.
     */
    @GetMapping("")
    public ResponseEntity<List<PlanoLeitura>> getAllPlanoLeituras(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of PlanoLeituras");
        Page<PlanoLeitura> page = planoLeituraRepository.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /plano-leituras/:id} : get the "id" planoLeitura.
     *
     * @param id the id of the planoLeitura to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the planoLeitura, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PlanoLeitura> getPlanoLeitura(@PathVariable("id") Long id) {
        LOG.debug("REST request to get PlanoLeitura : {}", id);
        Optional<PlanoLeitura> planoLeitura = planoLeituraRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(planoLeitura);
    }

    /**
     * {@code DELETE  /plano-leituras/:id} : delete the "id" planoLeitura.
     *
     * @param id the id of the planoLeitura to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlanoLeitura(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete PlanoLeitura : {}", id);
        planoLeituraRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
