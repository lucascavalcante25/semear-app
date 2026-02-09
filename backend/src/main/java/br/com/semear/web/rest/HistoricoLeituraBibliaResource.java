package br.com.semear.web.rest;

import br.com.semear.domain.HistoricoLeituraBiblia;
import br.com.semear.repository.HistoricoLeituraBibliaRepository;
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
 * REST controller for managing {@link br.com.semear.domain.HistoricoLeituraBiblia}.
 */
@RestController
@RequestMapping("/api/historico-leitura-biblias")
@Transactional
public class HistoricoLeituraBibliaResource {

    private static final Logger LOG = LoggerFactory.getLogger(HistoricoLeituraBibliaResource.class);

    private static final String ENTITY_NAME = "historicoLeituraBiblia";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final HistoricoLeituraBibliaRepository historicoLeituraBibliaRepository;

    public HistoricoLeituraBibliaResource(HistoricoLeituraBibliaRepository historicoLeituraBibliaRepository) {
        this.historicoLeituraBibliaRepository = historicoLeituraBibliaRepository;
    }

    /**
     * {@code POST  /historico-leitura-biblias} : Create a new historicoLeituraBiblia.
     *
     * @param historicoLeituraBiblia the historicoLeituraBiblia to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new historicoLeituraBiblia, or with status {@code 400 (Bad Request)} if the historicoLeituraBiblia has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<HistoricoLeituraBiblia> createHistoricoLeituraBiblia(
        @Valid @RequestBody HistoricoLeituraBiblia historicoLeituraBiblia
    ) throws URISyntaxException {
        LOG.debug("REST request to save HistoricoLeituraBiblia : {}", historicoLeituraBiblia);
        if (historicoLeituraBiblia.getId() != null) {
            throw new BadRequestAlertException("A new historicoLeituraBiblia cannot already have an ID", ENTITY_NAME, "idexists");
        }
        historicoLeituraBiblia = historicoLeituraBibliaRepository.save(historicoLeituraBiblia);
        return ResponseEntity.created(new URI("/api/historico-leitura-biblias/" + historicoLeituraBiblia.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, historicoLeituraBiblia.getId().toString()))
            .body(historicoLeituraBiblia);
    }

    /**
     * {@code PUT  /historico-leitura-biblias/:id} : Updates an existing historicoLeituraBiblia.
     *
     * @param id the id of the historicoLeituraBiblia to save.
     * @param historicoLeituraBiblia the historicoLeituraBiblia to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated historicoLeituraBiblia,
     * or with status {@code 400 (Bad Request)} if the historicoLeituraBiblia is not valid,
     * or with status {@code 500 (Internal Server Error)} if the historicoLeituraBiblia couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<HistoricoLeituraBiblia> updateHistoricoLeituraBiblia(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody HistoricoLeituraBiblia historicoLeituraBiblia
    ) throws URISyntaxException {
        LOG.debug("REST request to update HistoricoLeituraBiblia : {}, {}", id, historicoLeituraBiblia);
        if (historicoLeituraBiblia.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, historicoLeituraBiblia.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!historicoLeituraBibliaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        historicoLeituraBiblia = historicoLeituraBibliaRepository.save(historicoLeituraBiblia);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, historicoLeituraBiblia.getId().toString()))
            .body(historicoLeituraBiblia);
    }

    /**
     * {@code PATCH  /historico-leitura-biblias/:id} : Partial updates given fields of an existing historicoLeituraBiblia, field will ignore if it is null
     *
     * @param id the id of the historicoLeituraBiblia to save.
     * @param historicoLeituraBiblia the historicoLeituraBiblia to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated historicoLeituraBiblia,
     * or with status {@code 400 (Bad Request)} if the historicoLeituraBiblia is not valid,
     * or with status {@code 404 (Not Found)} if the historicoLeituraBiblia is not found,
     * or with status {@code 500 (Internal Server Error)} if the historicoLeituraBiblia couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<HistoricoLeituraBiblia> partialUpdateHistoricoLeituraBiblia(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody HistoricoLeituraBiblia historicoLeituraBiblia
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update HistoricoLeituraBiblia partially : {}, {}", id, historicoLeituraBiblia);
        if (historicoLeituraBiblia.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, historicoLeituraBiblia.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!historicoLeituraBibliaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<HistoricoLeituraBiblia> result = historicoLeituraBibliaRepository
            .findById(historicoLeituraBiblia.getId())
            .map(existingHistoricoLeituraBiblia -> {
                if (historicoLeituraBiblia.getLivroId() != null) {
                    existingHistoricoLeituraBiblia.setLivroId(historicoLeituraBiblia.getLivroId());
                }
                if (historicoLeituraBiblia.getLivroNome() != null) {
                    existingHistoricoLeituraBiblia.setLivroNome(historicoLeituraBiblia.getLivroNome());
                }
                if (historicoLeituraBiblia.getCapitulo() != null) {
                    existingHistoricoLeituraBiblia.setCapitulo(historicoLeituraBiblia.getCapitulo());
                }
                if (historicoLeituraBiblia.getVersiculoInicio() != null) {
                    existingHistoricoLeituraBiblia.setVersiculoInicio(historicoLeituraBiblia.getVersiculoInicio());
                }
                if (historicoLeituraBiblia.getVersiculoFim() != null) {
                    existingHistoricoLeituraBiblia.setVersiculoFim(historicoLeituraBiblia.getVersiculoFim());
                }
                if (historicoLeituraBiblia.getVersao() != null) {
                    existingHistoricoLeituraBiblia.setVersao(historicoLeituraBiblia.getVersao());
                }
                if (historicoLeituraBiblia.getLidoEm() != null) {
                    existingHistoricoLeituraBiblia.setLidoEm(historicoLeituraBiblia.getLidoEm());
                }

                return existingHistoricoLeituraBiblia;
            })
            .map(historicoLeituraBibliaRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, historicoLeituraBiblia.getId().toString())
        );
    }

    /**
     * {@code GET  /historico-leitura-biblias} : get all the historicoLeituraBiblias.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of historicoLeituraBiblias in body.
     */
    @GetMapping("")
    public ResponseEntity<List<HistoricoLeituraBiblia>> getAllHistoricoLeituraBiblias(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of HistoricoLeituraBiblias");
        Page<HistoricoLeituraBiblia> page;
        if (eagerload) {
            page = historicoLeituraBibliaRepository.findAllWithEagerRelationships(pageable);
        } else {
            page = historicoLeituraBibliaRepository.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /historico-leitura-biblias/:id} : get the "id" historicoLeituraBiblia.
     *
     * @param id the id of the historicoLeituraBiblia to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the historicoLeituraBiblia, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<HistoricoLeituraBiblia> getHistoricoLeituraBiblia(@PathVariable("id") Long id) {
        LOG.debug("REST request to get HistoricoLeituraBiblia : {}", id);
        Optional<HistoricoLeituraBiblia> historicoLeituraBiblia = historicoLeituraBibliaRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(historicoLeituraBiblia);
    }

    /**
     * {@code DELETE  /historico-leitura-biblias/:id} : delete the "id" historicoLeituraBiblia.
     *
     * @param id the id of the historicoLeituraBiblia to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHistoricoLeituraBiblia(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete HistoricoLeituraBiblia : {}", id);
        historicoLeituraBibliaRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
