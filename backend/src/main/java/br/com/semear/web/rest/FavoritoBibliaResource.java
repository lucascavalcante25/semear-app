package br.com.semear.web.rest;

import br.com.semear.domain.FavoritoBiblia;
import br.com.semear.repository.FavoritoBibliaRepository;
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
 * REST controller for managing {@link br.com.semear.domain.FavoritoBiblia}.
 */
@RestController
@RequestMapping("/api/favorito-biblias")
@Transactional
public class FavoritoBibliaResource {

    private static final Logger LOG = LoggerFactory.getLogger(FavoritoBibliaResource.class);

    private static final String ENTITY_NAME = "favoritoBiblia";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final FavoritoBibliaRepository favoritoBibliaRepository;

    public FavoritoBibliaResource(FavoritoBibliaRepository favoritoBibliaRepository) {
        this.favoritoBibliaRepository = favoritoBibliaRepository;
    }

    /**
     * {@code POST  /favorito-biblias} : Create a new favoritoBiblia.
     *
     * @param favoritoBiblia the favoritoBiblia to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new favoritoBiblia, or with status {@code 400 (Bad Request)} if the favoritoBiblia has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<FavoritoBiblia> createFavoritoBiblia(@Valid @RequestBody FavoritoBiblia favoritoBiblia)
        throws URISyntaxException {
        LOG.debug("REST request to save FavoritoBiblia : {}", favoritoBiblia);
        if (favoritoBiblia.getId() != null) {
            throw new BadRequestAlertException("A new favoritoBiblia cannot already have an ID", ENTITY_NAME, "idexists");
        }
        favoritoBiblia = favoritoBibliaRepository.save(favoritoBiblia);
        return ResponseEntity.created(new URI("/api/favorito-biblias/" + favoritoBiblia.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, favoritoBiblia.getId().toString()))
            .body(favoritoBiblia);
    }

    /**
     * {@code PUT  /favorito-biblias/:id} : Updates an existing favoritoBiblia.
     *
     * @param id the id of the favoritoBiblia to save.
     * @param favoritoBiblia the favoritoBiblia to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated favoritoBiblia,
     * or with status {@code 400 (Bad Request)} if the favoritoBiblia is not valid,
     * or with status {@code 500 (Internal Server Error)} if the favoritoBiblia couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<FavoritoBiblia> updateFavoritoBiblia(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody FavoritoBiblia favoritoBiblia
    ) throws URISyntaxException {
        LOG.debug("REST request to update FavoritoBiblia : {}, {}", id, favoritoBiblia);
        if (favoritoBiblia.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, favoritoBiblia.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!favoritoBibliaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        favoritoBiblia = favoritoBibliaRepository.save(favoritoBiblia);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, favoritoBiblia.getId().toString()))
            .body(favoritoBiblia);
    }

    /**
     * {@code PATCH  /favorito-biblias/:id} : Partial updates given fields of an existing favoritoBiblia, field will ignore if it is null
     *
     * @param id the id of the favoritoBiblia to save.
     * @param favoritoBiblia the favoritoBiblia to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated favoritoBiblia,
     * or with status {@code 400 (Bad Request)} if the favoritoBiblia is not valid,
     * or with status {@code 404 (Not Found)} if the favoritoBiblia is not found,
     * or with status {@code 500 (Internal Server Error)} if the favoritoBiblia couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<FavoritoBiblia> partialUpdateFavoritoBiblia(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody FavoritoBiblia favoritoBiblia
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update FavoritoBiblia partially : {}, {}", id, favoritoBiblia);
        if (favoritoBiblia.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, favoritoBiblia.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!favoritoBibliaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<FavoritoBiblia> result = favoritoBibliaRepository
            .findById(favoritoBiblia.getId())
            .map(existingFavoritoBiblia -> {
                if (favoritoBiblia.getChaveReferencia() != null) {
                    existingFavoritoBiblia.setChaveReferencia(favoritoBiblia.getChaveReferencia());
                }
                if (favoritoBiblia.getLivroId() != null) {
                    existingFavoritoBiblia.setLivroId(favoritoBiblia.getLivroId());
                }
                if (favoritoBiblia.getLivroNome() != null) {
                    existingFavoritoBiblia.setLivroNome(favoritoBiblia.getLivroNome());
                }
                if (favoritoBiblia.getCapitulo() != null) {
                    existingFavoritoBiblia.setCapitulo(favoritoBiblia.getCapitulo());
                }
                if (favoritoBiblia.getVersiculoInicio() != null) {
                    existingFavoritoBiblia.setVersiculoInicio(favoritoBiblia.getVersiculoInicio());
                }
                if (favoritoBiblia.getVersiculoFim() != null) {
                    existingFavoritoBiblia.setVersiculoFim(favoritoBiblia.getVersiculoFim());
                }
                if (favoritoBiblia.getVersao() != null) {
                    existingFavoritoBiblia.setVersao(favoritoBiblia.getVersao());
                }
                if (favoritoBiblia.getCriadoEm() != null) {
                    existingFavoritoBiblia.setCriadoEm(favoritoBiblia.getCriadoEm());
                }
                if (favoritoBiblia.getAtualizadoEm() != null) {
                    existingFavoritoBiblia.setAtualizadoEm(favoritoBiblia.getAtualizadoEm());
                }

                return existingFavoritoBiblia;
            })
            .map(favoritoBibliaRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, favoritoBiblia.getId().toString())
        );
    }

    /**
     * {@code GET  /favorito-biblias} : get all the favoritoBiblias.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of favoritoBiblias in body.
     */
    @GetMapping("")
    public ResponseEntity<List<FavoritoBiblia>> getAllFavoritoBiblias(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of FavoritoBiblias");
        Page<FavoritoBiblia> page;
        if (eagerload) {
            page = favoritoBibliaRepository.findAllWithEagerRelationships(pageable);
        } else {
            page = favoritoBibliaRepository.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /favorito-biblias/:id} : get the "id" favoritoBiblia.
     *
     * @param id the id of the favoritoBiblia to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the favoritoBiblia, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<FavoritoBiblia> getFavoritoBiblia(@PathVariable("id") Long id) {
        LOG.debug("REST request to get FavoritoBiblia : {}", id);
        Optional<FavoritoBiblia> favoritoBiblia = favoritoBibliaRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(favoritoBiblia);
    }

    /**
     * {@code DELETE  /favorito-biblias/:id} : delete the "id" favoritoBiblia.
     *
     * @param id the id of the favoritoBiblia to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFavoritoBiblia(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete FavoritoBiblia : {}", id);
        favoritoBibliaRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
