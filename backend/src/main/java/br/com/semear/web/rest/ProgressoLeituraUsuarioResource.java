package br.com.semear.web.rest;

import br.com.semear.domain.ProgressoLeituraUsuario;
import br.com.semear.repository.ProgressoLeituraUsuarioRepository;
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
 * REST controller for managing {@link br.com.semear.domain.ProgressoLeituraUsuario}.
 */
@RestController
@RequestMapping("/api/progresso-leitura-usuarios")
@Transactional
public class ProgressoLeituraUsuarioResource {

    private static final Logger LOG = LoggerFactory.getLogger(ProgressoLeituraUsuarioResource.class);

    private static final String ENTITY_NAME = "progressoLeituraUsuario";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ProgressoLeituraUsuarioRepository progressoLeituraUsuarioRepository;

    public ProgressoLeituraUsuarioResource(ProgressoLeituraUsuarioRepository progressoLeituraUsuarioRepository) {
        this.progressoLeituraUsuarioRepository = progressoLeituraUsuarioRepository;
    }

    /**
     * {@code POST  /progresso-leitura-usuarios} : Create a new progressoLeituraUsuario.
     *
     * @param progressoLeituraUsuario the progressoLeituraUsuario to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new progressoLeituraUsuario, or with status {@code 400 (Bad Request)} if the progressoLeituraUsuario has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<ProgressoLeituraUsuario> createProgressoLeituraUsuario(
        @Valid @RequestBody ProgressoLeituraUsuario progressoLeituraUsuario
    ) throws URISyntaxException {
        LOG.debug("REST request to save ProgressoLeituraUsuario : {}", progressoLeituraUsuario);
        if (progressoLeituraUsuario.getId() != null) {
            throw new BadRequestAlertException("A new progressoLeituraUsuario cannot already have an ID", ENTITY_NAME, "idexists");
        }
        progressoLeituraUsuario = progressoLeituraUsuarioRepository.save(progressoLeituraUsuario);
        return ResponseEntity.created(new URI("/api/progresso-leitura-usuarios/" + progressoLeituraUsuario.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, progressoLeituraUsuario.getId().toString()))
            .body(progressoLeituraUsuario);
    }

    /**
     * {@code PUT  /progresso-leitura-usuarios/:id} : Updates an existing progressoLeituraUsuario.
     *
     * @param id the id of the progressoLeituraUsuario to save.
     * @param progressoLeituraUsuario the progressoLeituraUsuario to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated progressoLeituraUsuario,
     * or with status {@code 400 (Bad Request)} if the progressoLeituraUsuario is not valid,
     * or with status {@code 500 (Internal Server Error)} if the progressoLeituraUsuario couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProgressoLeituraUsuario> updateProgressoLeituraUsuario(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody ProgressoLeituraUsuario progressoLeituraUsuario
    ) throws URISyntaxException {
        LOG.debug("REST request to update ProgressoLeituraUsuario : {}, {}", id, progressoLeituraUsuario);
        if (progressoLeituraUsuario.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, progressoLeituraUsuario.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!progressoLeituraUsuarioRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        progressoLeituraUsuario = progressoLeituraUsuarioRepository.save(progressoLeituraUsuario);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, progressoLeituraUsuario.getId().toString()))
            .body(progressoLeituraUsuario);
    }

    /**
     * {@code PATCH  /progresso-leitura-usuarios/:id} : Partial updates given fields of an existing progressoLeituraUsuario, field will ignore if it is null
     *
     * @param id the id of the progressoLeituraUsuario to save.
     * @param progressoLeituraUsuario the progressoLeituraUsuario to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated progressoLeituraUsuario,
     * or with status {@code 400 (Bad Request)} if the progressoLeituraUsuario is not valid,
     * or with status {@code 404 (Not Found)} if the progressoLeituraUsuario is not found,
     * or with status {@code 500 (Internal Server Error)} if the progressoLeituraUsuario couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ProgressoLeituraUsuario> partialUpdateProgressoLeituraUsuario(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody ProgressoLeituraUsuario progressoLeituraUsuario
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update ProgressoLeituraUsuario partially : {}, {}", id, progressoLeituraUsuario);
        if (progressoLeituraUsuario.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, progressoLeituraUsuario.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!progressoLeituraUsuarioRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ProgressoLeituraUsuario> result = progressoLeituraUsuarioRepository
            .findById(progressoLeituraUsuario.getId())
            .map(existingProgressoLeituraUsuario -> {
                if (progressoLeituraUsuario.getData() != null) {
                    existingProgressoLeituraUsuario.setData(progressoLeituraUsuario.getData());
                }
                if (progressoLeituraUsuario.getConcluido() != null) {
                    existingProgressoLeituraUsuario.setConcluido(progressoLeituraUsuario.getConcluido());
                }
                if (progressoLeituraUsuario.getConcluidoEm() != null) {
                    existingProgressoLeituraUsuario.setConcluidoEm(progressoLeituraUsuario.getConcluidoEm());
                }
                if (progressoLeituraUsuario.getCriadoEm() != null) {
                    existingProgressoLeituraUsuario.setCriadoEm(progressoLeituraUsuario.getCriadoEm());
                }
                if (progressoLeituraUsuario.getAtualizadoEm() != null) {
                    existingProgressoLeituraUsuario.setAtualizadoEm(progressoLeituraUsuario.getAtualizadoEm());
                }

                return existingProgressoLeituraUsuario;
            })
            .map(progressoLeituraUsuarioRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, progressoLeituraUsuario.getId().toString())
        );
    }

    /**
     * {@code GET  /progresso-leitura-usuarios} : get all the progressoLeituraUsuarios.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of progressoLeituraUsuarios in body.
     */
    @GetMapping("")
    public List<ProgressoLeituraUsuario> getAllProgressoLeituraUsuarios(
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get all ProgressoLeituraUsuarios");
        if (eagerload) {
            return progressoLeituraUsuarioRepository.findAllWithEagerRelationships();
        } else {
            return progressoLeituraUsuarioRepository.findAll();
        }
    }

    /**
     * {@code GET  /progresso-leitura-usuarios/:id} : get the "id" progressoLeituraUsuario.
     *
     * @param id the id of the progressoLeituraUsuario to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the progressoLeituraUsuario, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProgressoLeituraUsuario> getProgressoLeituraUsuario(@PathVariable("id") Long id) {
        LOG.debug("REST request to get ProgressoLeituraUsuario : {}", id);
        Optional<ProgressoLeituraUsuario> progressoLeituraUsuario = progressoLeituraUsuarioRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(progressoLeituraUsuario);
    }

    /**
     * {@code DELETE  /progresso-leitura-usuarios/:id} : delete the "id" progressoLeituraUsuario.
     *
     * @param id the id of the progressoLeituraUsuario to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProgressoLeituraUsuario(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete ProgressoLeituraUsuario : {}", id);
        progressoLeituraUsuarioRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
