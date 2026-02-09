package br.com.semear.web.rest;

import br.com.semear.domain.CapituloBibliaCache;
import br.com.semear.repository.CapituloBibliaCacheRepository;
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
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link br.com.semear.domain.CapituloBibliaCache}.
 */
@RestController
@RequestMapping("/api/capitulo-biblia-caches")
@Transactional
public class CapituloBibliaCacheResource {

    private static final Logger LOG = LoggerFactory.getLogger(CapituloBibliaCacheResource.class);

    private static final String ENTITY_NAME = "capituloBibliaCache";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final CapituloBibliaCacheRepository capituloBibliaCacheRepository;

    public CapituloBibliaCacheResource(CapituloBibliaCacheRepository capituloBibliaCacheRepository) {
        this.capituloBibliaCacheRepository = capituloBibliaCacheRepository;
    }

    /**
     * {@code POST  /capitulo-biblia-caches} : Create a new capituloBibliaCache.
     *
     * @param capituloBibliaCache the capituloBibliaCache to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new capituloBibliaCache, or with status {@code 400 (Bad Request)} if the capituloBibliaCache has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<CapituloBibliaCache> createCapituloBibliaCache(@Valid @RequestBody CapituloBibliaCache capituloBibliaCache)
        throws URISyntaxException {
        LOG.debug("REST request to save CapituloBibliaCache : {}", capituloBibliaCache);
        if (capituloBibliaCache.getId() != null) {
            throw new BadRequestAlertException("A new capituloBibliaCache cannot already have an ID", ENTITY_NAME, "idexists");
        }
        capituloBibliaCache = capituloBibliaCacheRepository.save(capituloBibliaCache);
        return ResponseEntity.created(new URI("/api/capitulo-biblia-caches/" + capituloBibliaCache.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, capituloBibliaCache.getId().toString()))
            .body(capituloBibliaCache);
    }

    /**
     * {@code PUT  /capitulo-biblia-caches/:id} : Updates an existing capituloBibliaCache.
     *
     * @param id the id of the capituloBibliaCache to save.
     * @param capituloBibliaCache the capituloBibliaCache to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated capituloBibliaCache,
     * or with status {@code 400 (Bad Request)} if the capituloBibliaCache is not valid,
     * or with status {@code 500 (Internal Server Error)} if the capituloBibliaCache couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CapituloBibliaCache> updateCapituloBibliaCache(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody CapituloBibliaCache capituloBibliaCache
    ) throws URISyntaxException {
        LOG.debug("REST request to update CapituloBibliaCache : {}, {}", id, capituloBibliaCache);
        if (capituloBibliaCache.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, capituloBibliaCache.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!capituloBibliaCacheRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        capituloBibliaCache = capituloBibliaCacheRepository.save(capituloBibliaCache);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, capituloBibliaCache.getId().toString()))
            .body(capituloBibliaCache);
    }

    /**
     * {@code PATCH  /capitulo-biblia-caches/:id} : Partial updates given fields of an existing capituloBibliaCache, field will ignore if it is null
     *
     * @param id the id of the capituloBibliaCache to save.
     * @param capituloBibliaCache the capituloBibliaCache to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated capituloBibliaCache,
     * or with status {@code 400 (Bad Request)} if the capituloBibliaCache is not valid,
     * or with status {@code 404 (Not Found)} if the capituloBibliaCache is not found,
     * or with status {@code 500 (Internal Server Error)} if the capituloBibliaCache couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<CapituloBibliaCache> partialUpdateCapituloBibliaCache(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody CapituloBibliaCache capituloBibliaCache
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update CapituloBibliaCache partially : {}, {}", id, capituloBibliaCache);
        if (capituloBibliaCache.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, capituloBibliaCache.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!capituloBibliaCacheRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<CapituloBibliaCache> result = capituloBibliaCacheRepository
            .findById(capituloBibliaCache.getId())
            .map(existingCapituloBibliaCache -> {
                if (capituloBibliaCache.getLivroId() != null) {
                    existingCapituloBibliaCache.setLivroId(capituloBibliaCache.getLivroId());
                }
                if (capituloBibliaCache.getLivroNome() != null) {
                    existingCapituloBibliaCache.setLivroNome(capituloBibliaCache.getLivroNome());
                }
                if (capituloBibliaCache.getCapitulo() != null) {
                    existingCapituloBibliaCache.setCapitulo(capituloBibliaCache.getCapitulo());
                }
                if (capituloBibliaCache.getVersao() != null) {
                    existingCapituloBibliaCache.setVersao(capituloBibliaCache.getVersao());
                }
                if (capituloBibliaCache.getVersiculosJson() != null) {
                    existingCapituloBibliaCache.setVersiculosJson(capituloBibliaCache.getVersiculosJson());
                }
                if (capituloBibliaCache.getCacheadoEm() != null) {
                    existingCapituloBibliaCache.setCacheadoEm(capituloBibliaCache.getCacheadoEm());
                }

                return existingCapituloBibliaCache;
            })
            .map(capituloBibliaCacheRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, capituloBibliaCache.getId().toString())
        );
    }

    /**
     * {@code GET  /capitulo-biblia-caches} : get all the capituloBibliaCaches.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of capituloBibliaCaches in body.
     */
    @GetMapping("")
    public List<CapituloBibliaCache> getAllCapituloBibliaCaches() {
        LOG.debug("REST request to get all CapituloBibliaCaches");
        return capituloBibliaCacheRepository.findAll();
    }

    /**
     * {@code GET  /capitulo-biblia-caches/:id} : get the "id" capituloBibliaCache.
     *
     * @param id the id of the capituloBibliaCache to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the capituloBibliaCache, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CapituloBibliaCache> getCapituloBibliaCache(@PathVariable("id") Long id) {
        LOG.debug("REST request to get CapituloBibliaCache : {}", id);
        Optional<CapituloBibliaCache> capituloBibliaCache = capituloBibliaCacheRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(capituloBibliaCache);
    }

    /**
     * {@code DELETE  /capitulo-biblia-caches/:id} : delete the "id" capituloBibliaCache.
     *
     * @param id the id of the capituloBibliaCache to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCapituloBibliaCache(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete CapituloBibliaCache : {}", id);
        capituloBibliaCacheRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
