package br.com.semear.web.rest;

import br.com.semear.domain.NotaBiblia;
import br.com.semear.repository.NotaBibliaRepository;
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
 * REST controller for managing {@link br.com.semear.domain.NotaBiblia}.
 */
@RestController
@RequestMapping("/api/nota-biblias")
@Transactional
public class NotaBibliaResource {

    private static final Logger LOG = LoggerFactory.getLogger(NotaBibliaResource.class);

    private static final String ENTITY_NAME = "notaBiblia";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final NotaBibliaRepository notaBibliaRepository;

    public NotaBibliaResource(NotaBibliaRepository notaBibliaRepository) {
        this.notaBibliaRepository = notaBibliaRepository;
    }

    /**
     * {@code POST  /nota-biblias} : Create a new notaBiblia.
     *
     * @param notaBiblia the notaBiblia to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new notaBiblia, or with status {@code 400 (Bad Request)} if the notaBiblia has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<NotaBiblia> createNotaBiblia(@Valid @RequestBody NotaBiblia notaBiblia) throws URISyntaxException {
        LOG.debug("REST request to save NotaBiblia : {}", notaBiblia);
        if (notaBiblia.getId() != null) {
            throw new BadRequestAlertException("A new notaBiblia cannot already have an ID", ENTITY_NAME, "idexists");
        }
        notaBiblia = notaBibliaRepository.save(notaBiblia);
        return ResponseEntity.created(new URI("/api/nota-biblias/" + notaBiblia.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, notaBiblia.getId().toString()))
            .body(notaBiblia);
    }

    /**
     * {@code PUT  /nota-biblias/:id} : Updates an existing notaBiblia.
     *
     * @param id the id of the notaBiblia to save.
     * @param notaBiblia the notaBiblia to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated notaBiblia,
     * or with status {@code 400 (Bad Request)} if the notaBiblia is not valid,
     * or with status {@code 500 (Internal Server Error)} if the notaBiblia couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<NotaBiblia> updateNotaBiblia(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody NotaBiblia notaBiblia
    ) throws URISyntaxException {
        LOG.debug("REST request to update NotaBiblia : {}, {}", id, notaBiblia);
        if (notaBiblia.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, notaBiblia.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!notaBibliaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        notaBiblia = notaBibliaRepository.save(notaBiblia);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, notaBiblia.getId().toString()))
            .body(notaBiblia);
    }

    /**
     * {@code PATCH  /nota-biblias/:id} : Partial updates given fields of an existing notaBiblia, field will ignore if it is null
     *
     * @param id the id of the notaBiblia to save.
     * @param notaBiblia the notaBiblia to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated notaBiblia,
     * or with status {@code 400 (Bad Request)} if the notaBiblia is not valid,
     * or with status {@code 404 (Not Found)} if the notaBiblia is not found,
     * or with status {@code 500 (Internal Server Error)} if the notaBiblia couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<NotaBiblia> partialUpdateNotaBiblia(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody NotaBiblia notaBiblia
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update NotaBiblia partially : {}, {}", id, notaBiblia);
        if (notaBiblia.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, notaBiblia.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!notaBibliaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<NotaBiblia> result = notaBibliaRepository
            .findById(notaBiblia.getId())
            .map(existingNotaBiblia -> {
                if (notaBiblia.getChaveReferencia() != null) {
                    existingNotaBiblia.setChaveReferencia(notaBiblia.getChaveReferencia());
                }
                if (notaBiblia.getLivroId() != null) {
                    existingNotaBiblia.setLivroId(notaBiblia.getLivroId());
                }
                if (notaBiblia.getLivroNome() != null) {
                    existingNotaBiblia.setLivroNome(notaBiblia.getLivroNome());
                }
                if (notaBiblia.getCapitulo() != null) {
                    existingNotaBiblia.setCapitulo(notaBiblia.getCapitulo());
                }
                if (notaBiblia.getVersiculoInicio() != null) {
                    existingNotaBiblia.setVersiculoInicio(notaBiblia.getVersiculoInicio());
                }
                if (notaBiblia.getVersiculoFim() != null) {
                    existingNotaBiblia.setVersiculoFim(notaBiblia.getVersiculoFim());
                }
                if (notaBiblia.getVersao() != null) {
                    existingNotaBiblia.setVersao(notaBiblia.getVersao());
                }
                if (notaBiblia.getConteudo() != null) {
                    existingNotaBiblia.setConteudo(notaBiblia.getConteudo());
                }
                if (notaBiblia.getCriadoEm() != null) {
                    existingNotaBiblia.setCriadoEm(notaBiblia.getCriadoEm());
                }
                if (notaBiblia.getAtualizadoEm() != null) {
                    existingNotaBiblia.setAtualizadoEm(notaBiblia.getAtualizadoEm());
                }

                return existingNotaBiblia;
            })
            .map(notaBibliaRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, notaBiblia.getId().toString())
        );
    }

    /**
     * {@code GET  /nota-biblias} : get all the notaBiblias.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of notaBiblias in body.
     */
    @GetMapping("")
    public ResponseEntity<List<NotaBiblia>> getAllNotaBiblias(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of NotaBiblias");
        Page<NotaBiblia> page;
        if (eagerload) {
            page = notaBibliaRepository.findAllWithEagerRelationships(pageable);
        } else {
            page = notaBibliaRepository.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /nota-biblias/:id} : get the "id" notaBiblia.
     *
     * @param id the id of the notaBiblia to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the notaBiblia, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<NotaBiblia> getNotaBiblia(@PathVariable("id") Long id) {
        LOG.debug("REST request to get NotaBiblia : {}", id);
        Optional<NotaBiblia> notaBiblia = notaBibliaRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(notaBiblia);
    }

    /**
     * {@code DELETE  /nota-biblias/:id} : delete the "id" notaBiblia.
     *
     * @param id the id of the notaBiblia to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotaBiblia(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete NotaBiblia : {}", id);
        notaBibliaRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
