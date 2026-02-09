package br.com.semear.web.rest;

import br.com.semear.domain.DestaqueBiblia;
import br.com.semear.repository.DestaqueBibliaRepository;
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
 * REST controller for managing {@link br.com.semear.domain.DestaqueBiblia}.
 */
@RestController
@RequestMapping("/api/destaque-biblias")
@Transactional
public class DestaqueBibliaResource {

    private static final Logger LOG = LoggerFactory.getLogger(DestaqueBibliaResource.class);

    private static final String ENTITY_NAME = "destaqueBiblia";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final DestaqueBibliaRepository destaqueBibliaRepository;

    public DestaqueBibliaResource(DestaqueBibliaRepository destaqueBibliaRepository) {
        this.destaqueBibliaRepository = destaqueBibliaRepository;
    }

    /**
     * {@code POST  /destaque-biblias} : Create a new destaqueBiblia.
     *
     * @param destaqueBiblia the destaqueBiblia to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new destaqueBiblia, or with status {@code 400 (Bad Request)} if the destaqueBiblia has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<DestaqueBiblia> createDestaqueBiblia(@Valid @RequestBody DestaqueBiblia destaqueBiblia)
        throws URISyntaxException {
        LOG.debug("REST request to save DestaqueBiblia : {}", destaqueBiblia);
        if (destaqueBiblia.getId() != null) {
            throw new BadRequestAlertException("A new destaqueBiblia cannot already have an ID", ENTITY_NAME, "idexists");
        }
        destaqueBiblia = destaqueBibliaRepository.save(destaqueBiblia);
        return ResponseEntity.created(new URI("/api/destaque-biblias/" + destaqueBiblia.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, destaqueBiblia.getId().toString()))
            .body(destaqueBiblia);
    }

    /**
     * {@code PUT  /destaque-biblias/:id} : Updates an existing destaqueBiblia.
     *
     * @param id the id of the destaqueBiblia to save.
     * @param destaqueBiblia the destaqueBiblia to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated destaqueBiblia,
     * or with status {@code 400 (Bad Request)} if the destaqueBiblia is not valid,
     * or with status {@code 500 (Internal Server Error)} if the destaqueBiblia couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<DestaqueBiblia> updateDestaqueBiblia(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody DestaqueBiblia destaqueBiblia
    ) throws URISyntaxException {
        LOG.debug("REST request to update DestaqueBiblia : {}, {}", id, destaqueBiblia);
        if (destaqueBiblia.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, destaqueBiblia.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!destaqueBibliaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        destaqueBiblia = destaqueBibliaRepository.save(destaqueBiblia);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, destaqueBiblia.getId().toString()))
            .body(destaqueBiblia);
    }

    /**
     * {@code PATCH  /destaque-biblias/:id} : Partial updates given fields of an existing destaqueBiblia, field will ignore if it is null
     *
     * @param id the id of the destaqueBiblia to save.
     * @param destaqueBiblia the destaqueBiblia to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated destaqueBiblia,
     * or with status {@code 400 (Bad Request)} if the destaqueBiblia is not valid,
     * or with status {@code 404 (Not Found)} if the destaqueBiblia is not found,
     * or with status {@code 500 (Internal Server Error)} if the destaqueBiblia couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<DestaqueBiblia> partialUpdateDestaqueBiblia(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody DestaqueBiblia destaqueBiblia
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update DestaqueBiblia partially : {}, {}", id, destaqueBiblia);
        if (destaqueBiblia.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, destaqueBiblia.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!destaqueBibliaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<DestaqueBiblia> result = destaqueBibliaRepository
            .findById(destaqueBiblia.getId())
            .map(existingDestaqueBiblia -> {
                if (destaqueBiblia.getChaveReferencia() != null) {
                    existingDestaqueBiblia.setChaveReferencia(destaqueBiblia.getChaveReferencia());
                }
                if (destaqueBiblia.getLivroId() != null) {
                    existingDestaqueBiblia.setLivroId(destaqueBiblia.getLivroId());
                }
                if (destaqueBiblia.getLivroNome() != null) {
                    existingDestaqueBiblia.setLivroNome(destaqueBiblia.getLivroNome());
                }
                if (destaqueBiblia.getCapitulo() != null) {
                    existingDestaqueBiblia.setCapitulo(destaqueBiblia.getCapitulo());
                }
                if (destaqueBiblia.getVersiculoInicio() != null) {
                    existingDestaqueBiblia.setVersiculoInicio(destaqueBiblia.getVersiculoInicio());
                }
                if (destaqueBiblia.getVersiculoFim() != null) {
                    existingDestaqueBiblia.setVersiculoFim(destaqueBiblia.getVersiculoFim());
                }
                if (destaqueBiblia.getVersao() != null) {
                    existingDestaqueBiblia.setVersao(destaqueBiblia.getVersao());
                }
                if (destaqueBiblia.getCor() != null) {
                    existingDestaqueBiblia.setCor(destaqueBiblia.getCor());
                }
                if (destaqueBiblia.getCriadoEm() != null) {
                    existingDestaqueBiblia.setCriadoEm(destaqueBiblia.getCriadoEm());
                }
                if (destaqueBiblia.getAtualizadoEm() != null) {
                    existingDestaqueBiblia.setAtualizadoEm(destaqueBiblia.getAtualizadoEm());
                }

                return existingDestaqueBiblia;
            })
            .map(destaqueBibliaRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, destaqueBiblia.getId().toString())
        );
    }

    /**
     * {@code GET  /destaque-biblias} : get all the destaqueBiblias.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of destaqueBiblias in body.
     */
    @GetMapping("")
    public ResponseEntity<List<DestaqueBiblia>> getAllDestaqueBiblias(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of DestaqueBiblias");
        Page<DestaqueBiblia> page;
        if (eagerload) {
            page = destaqueBibliaRepository.findAllWithEagerRelationships(pageable);
        } else {
            page = destaqueBibliaRepository.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /destaque-biblias/:id} : get the "id" destaqueBiblia.
     *
     * @param id the id of the destaqueBiblia to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the destaqueBiblia, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<DestaqueBiblia> getDestaqueBiblia(@PathVariable("id") Long id) {
        LOG.debug("REST request to get DestaqueBiblia : {}", id);
        Optional<DestaqueBiblia> destaqueBiblia = destaqueBibliaRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(destaqueBiblia);
    }

    /**
     * {@code DELETE  /destaque-biblias/:id} : delete the "id" destaqueBiblia.
     *
     * @param id the id of the destaqueBiblia to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDestaqueBiblia(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete DestaqueBiblia : {}", id);
        destaqueBibliaRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
