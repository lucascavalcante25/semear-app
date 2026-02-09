package br.com.semear.web.rest;

import br.com.semear.domain.PreferenciaBibliaUsuario;
import br.com.semear.repository.PreferenciaBibliaUsuarioRepository;
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
 * REST controller for managing {@link br.com.semear.domain.PreferenciaBibliaUsuario}.
 */
@RestController
@RequestMapping("/api/preferencia-biblia-usuarios")
@Transactional
public class PreferenciaBibliaUsuarioResource {

    private static final Logger LOG = LoggerFactory.getLogger(PreferenciaBibliaUsuarioResource.class);

    private static final String ENTITY_NAME = "preferenciaBibliaUsuario";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final PreferenciaBibliaUsuarioRepository preferenciaBibliaUsuarioRepository;

    public PreferenciaBibliaUsuarioResource(PreferenciaBibliaUsuarioRepository preferenciaBibliaUsuarioRepository) {
        this.preferenciaBibliaUsuarioRepository = preferenciaBibliaUsuarioRepository;
    }

    /**
     * {@code POST  /preferencia-biblia-usuarios} : Create a new preferenciaBibliaUsuario.
     *
     * @param preferenciaBibliaUsuario the preferenciaBibliaUsuario to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new preferenciaBibliaUsuario, or with status {@code 400 (Bad Request)} if the preferenciaBibliaUsuario has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<PreferenciaBibliaUsuario> createPreferenciaBibliaUsuario(
        @Valid @RequestBody PreferenciaBibliaUsuario preferenciaBibliaUsuario
    ) throws URISyntaxException {
        LOG.debug("REST request to save PreferenciaBibliaUsuario : {}", preferenciaBibliaUsuario);
        if (preferenciaBibliaUsuario.getId() != null) {
            throw new BadRequestAlertException("A new preferenciaBibliaUsuario cannot already have an ID", ENTITY_NAME, "idexists");
        }
        preferenciaBibliaUsuario = preferenciaBibliaUsuarioRepository.save(preferenciaBibliaUsuario);
        return ResponseEntity.created(new URI("/api/preferencia-biblia-usuarios/" + preferenciaBibliaUsuario.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, preferenciaBibliaUsuario.getId().toString()))
            .body(preferenciaBibliaUsuario);
    }

    /**
     * {@code PUT  /preferencia-biblia-usuarios/:id} : Updates an existing preferenciaBibliaUsuario.
     *
     * @param id the id of the preferenciaBibliaUsuario to save.
     * @param preferenciaBibliaUsuario the preferenciaBibliaUsuario to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated preferenciaBibliaUsuario,
     * or with status {@code 400 (Bad Request)} if the preferenciaBibliaUsuario is not valid,
     * or with status {@code 500 (Internal Server Error)} if the preferenciaBibliaUsuario couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<PreferenciaBibliaUsuario> updatePreferenciaBibliaUsuario(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody PreferenciaBibliaUsuario preferenciaBibliaUsuario
    ) throws URISyntaxException {
        LOG.debug("REST request to update PreferenciaBibliaUsuario : {}, {}", id, preferenciaBibliaUsuario);
        if (preferenciaBibliaUsuario.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, preferenciaBibliaUsuario.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!preferenciaBibliaUsuarioRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        preferenciaBibliaUsuario = preferenciaBibliaUsuarioRepository.save(preferenciaBibliaUsuario);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, preferenciaBibliaUsuario.getId().toString()))
            .body(preferenciaBibliaUsuario);
    }

    /**
     * {@code PATCH  /preferencia-biblia-usuarios/:id} : Partial updates given fields of an existing preferenciaBibliaUsuario, field will ignore if it is null
     *
     * @param id the id of the preferenciaBibliaUsuario to save.
     * @param preferenciaBibliaUsuario the preferenciaBibliaUsuario to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated preferenciaBibliaUsuario,
     * or with status {@code 400 (Bad Request)} if the preferenciaBibliaUsuario is not valid,
     * or with status {@code 404 (Not Found)} if the preferenciaBibliaUsuario is not found,
     * or with status {@code 500 (Internal Server Error)} if the preferenciaBibliaUsuario couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<PreferenciaBibliaUsuario> partialUpdatePreferenciaBibliaUsuario(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody PreferenciaBibliaUsuario preferenciaBibliaUsuario
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update PreferenciaBibliaUsuario partially : {}, {}", id, preferenciaBibliaUsuario);
        if (preferenciaBibliaUsuario.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, preferenciaBibliaUsuario.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!preferenciaBibliaUsuarioRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<PreferenciaBibliaUsuario> result = preferenciaBibliaUsuarioRepository
            .findById(preferenciaBibliaUsuario.getId())
            .map(existingPreferenciaBibliaUsuario -> {
                if (preferenciaBibliaUsuario.getModo() != null) {
                    existingPreferenciaBibliaUsuario.setModo(preferenciaBibliaUsuario.getModo());
                }
                if (preferenciaBibliaUsuario.getTamanhoFonte() != null) {
                    existingPreferenciaBibliaUsuario.setTamanhoFonte(preferenciaBibliaUsuario.getTamanhoFonte());
                }
                if (preferenciaBibliaUsuario.getTema() != null) {
                    existingPreferenciaBibliaUsuario.setTema(preferenciaBibliaUsuario.getTema());
                }
                if (preferenciaBibliaUsuario.getMostrarDestaques() != null) {
                    existingPreferenciaBibliaUsuario.setMostrarDestaques(preferenciaBibliaUsuario.getMostrarDestaques());
                }
                if (preferenciaBibliaUsuario.getMostrarNotas() != null) {
                    existingPreferenciaBibliaUsuario.setMostrarNotas(preferenciaBibliaUsuario.getMostrarNotas());
                }
                if (preferenciaBibliaUsuario.getMostrarFavoritos() != null) {
                    existingPreferenciaBibliaUsuario.setMostrarFavoritos(preferenciaBibliaUsuario.getMostrarFavoritos());
                }
                if (preferenciaBibliaUsuario.getCriadoEm() != null) {
                    existingPreferenciaBibliaUsuario.setCriadoEm(preferenciaBibliaUsuario.getCriadoEm());
                }
                if (preferenciaBibliaUsuario.getAtualizadoEm() != null) {
                    existingPreferenciaBibliaUsuario.setAtualizadoEm(preferenciaBibliaUsuario.getAtualizadoEm());
                }

                return existingPreferenciaBibliaUsuario;
            })
            .map(preferenciaBibliaUsuarioRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, preferenciaBibliaUsuario.getId().toString())
        );
    }

    /**
     * {@code GET  /preferencia-biblia-usuarios} : get all the preferenciaBibliaUsuarios.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of preferenciaBibliaUsuarios in body.
     */
    @GetMapping("")
    public List<PreferenciaBibliaUsuario> getAllPreferenciaBibliaUsuarios(
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get all PreferenciaBibliaUsuarios");
        if (eagerload) {
            return preferenciaBibliaUsuarioRepository.findAllWithEagerRelationships();
        } else {
            return preferenciaBibliaUsuarioRepository.findAll();
        }
    }

    /**
     * {@code GET  /preferencia-biblia-usuarios/:id} : get the "id" preferenciaBibliaUsuario.
     *
     * @param id the id of the preferenciaBibliaUsuario to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the preferenciaBibliaUsuario, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PreferenciaBibliaUsuario> getPreferenciaBibliaUsuario(@PathVariable("id") Long id) {
        LOG.debug("REST request to get PreferenciaBibliaUsuario : {}", id);
        Optional<PreferenciaBibliaUsuario> preferenciaBibliaUsuario = preferenciaBibliaUsuarioRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(preferenciaBibliaUsuario);
    }

    /**
     * {@code DELETE  /preferencia-biblia-usuarios/:id} : delete the "id" preferenciaBibliaUsuario.
     *
     * @param id the id of the preferenciaBibliaUsuario to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePreferenciaBibliaUsuario(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete PreferenciaBibliaUsuario : {}", id);
        preferenciaBibliaUsuarioRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
