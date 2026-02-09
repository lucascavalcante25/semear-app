package br.com.semear.web.rest;

import br.com.semear.domain.PreCadastro;
import br.com.semear.repository.PreCadastroRepository;
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
 * REST controller for managing {@link br.com.semear.domain.PreCadastro}.
 */
@RestController
@RequestMapping("/api/pre-cadastros")
@Transactional
public class PreCadastroResource {

    private static final Logger LOG = LoggerFactory.getLogger(PreCadastroResource.class);

    private static final String ENTITY_NAME = "preCadastro";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final PreCadastroRepository preCadastroRepository;

    public PreCadastroResource(PreCadastroRepository preCadastroRepository) {
        this.preCadastroRepository = preCadastroRepository;
    }

    /**
     * {@code POST  /pre-cadastros} : Create a new preCadastro.
     *
     * @param preCadastro the preCadastro to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new preCadastro, or with status {@code 400 (Bad Request)} if the preCadastro has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<PreCadastro> createPreCadastro(@Valid @RequestBody PreCadastro preCadastro) throws URISyntaxException {
        LOG.debug("REST request to save PreCadastro : {}", preCadastro);
        if (preCadastro.getId() != null) {
            throw new BadRequestAlertException("A new preCadastro cannot already have an ID", ENTITY_NAME, "idexists");
        }
        preCadastro = preCadastroRepository.save(preCadastro);
        return ResponseEntity.created(new URI("/api/pre-cadastros/" + preCadastro.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, preCadastro.getId().toString()))
            .body(preCadastro);
    }

    /**
     * {@code PUT  /pre-cadastros/:id} : Updates an existing preCadastro.
     *
     * @param id the id of the preCadastro to save.
     * @param preCadastro the preCadastro to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated preCadastro,
     * or with status {@code 400 (Bad Request)} if the preCadastro is not valid,
     * or with status {@code 500 (Internal Server Error)} if the preCadastro couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<PreCadastro> updatePreCadastro(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody PreCadastro preCadastro
    ) throws URISyntaxException {
        LOG.debug("REST request to update PreCadastro : {}, {}", id, preCadastro);
        if (preCadastro.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, preCadastro.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!preCadastroRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        preCadastro = preCadastroRepository.save(preCadastro);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, preCadastro.getId().toString()))
            .body(preCadastro);
    }

    /**
     * {@code PATCH  /pre-cadastros/:id} : Partial updates given fields of an existing preCadastro, field will ignore if it is null
     *
     * @param id the id of the preCadastro to save.
     * @param preCadastro the preCadastro to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated preCadastro,
     * or with status {@code 400 (Bad Request)} if the preCadastro is not valid,
     * or with status {@code 404 (Not Found)} if the preCadastro is not found,
     * or with status {@code 500 (Internal Server Error)} if the preCadastro couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<PreCadastro> partialUpdatePreCadastro(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody PreCadastro preCadastro
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update PreCadastro partially : {}, {}", id, preCadastro);
        if (preCadastro.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, preCadastro.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!preCadastroRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<PreCadastro> result = preCadastroRepository
            .findById(preCadastro.getId())
            .map(existingPreCadastro -> {
                if (preCadastro.getNomeCompleto() != null) {
                    existingPreCadastro.setNomeCompleto(preCadastro.getNomeCompleto());
                }
                if (preCadastro.getEmail() != null) {
                    existingPreCadastro.setEmail(preCadastro.getEmail());
                }
                if (preCadastro.getTelefone() != null) {
                    existingPreCadastro.setTelefone(preCadastro.getTelefone());
                }
                if (preCadastro.getTelefoneSecundario() != null) {
                    existingPreCadastro.setTelefoneSecundario(preCadastro.getTelefoneSecundario());
                }
                if (preCadastro.getTelefoneEmergencia() != null) {
                    existingPreCadastro.setTelefoneEmergencia(preCadastro.getTelefoneEmergencia());
                }
                if (preCadastro.getNomeContatoEmergencia() != null) {
                    existingPreCadastro.setNomeContatoEmergencia(preCadastro.getNomeContatoEmergencia());
                }
                if (preCadastro.getCpf() != null) {
                    existingPreCadastro.setCpf(preCadastro.getCpf());
                }
                if (preCadastro.getSexo() != null) {
                    existingPreCadastro.setSexo(preCadastro.getSexo());
                }
                if (preCadastro.getDataNascimento() != null) {
                    existingPreCadastro.setDataNascimento(preCadastro.getDataNascimento());
                }
                if (preCadastro.getLogin() != null) {
                    existingPreCadastro.setLogin(preCadastro.getLogin());
                }
                if (preCadastro.getSenha() != null) {
                    existingPreCadastro.setSenha(preCadastro.getSenha());
                }
                if (preCadastro.getPerfilSolicitado() != null) {
                    existingPreCadastro.setPerfilSolicitado(preCadastro.getPerfilSolicitado());
                }
                if (preCadastro.getPerfilAprovado() != null) {
                    existingPreCadastro.setPerfilAprovado(preCadastro.getPerfilAprovado());
                }
                if (preCadastro.getStatus() != null) {
                    existingPreCadastro.setStatus(preCadastro.getStatus());
                }
                if (preCadastro.getObservacoes() != null) {
                    existingPreCadastro.setObservacoes(preCadastro.getObservacoes());
                }
                if (preCadastro.getCriadoEm() != null) {
                    existingPreCadastro.setCriadoEm(preCadastro.getCriadoEm());
                }
                if (preCadastro.getAtualizadoEm() != null) {
                    existingPreCadastro.setAtualizadoEm(preCadastro.getAtualizadoEm());
                }

                return existingPreCadastro;
            })
            .map(preCadastroRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, preCadastro.getId().toString())
        );
    }

    /**
     * {@code GET  /pre-cadastros} : get all the preCadastros.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of preCadastros in body.
     */
    @GetMapping("")
    public ResponseEntity<List<PreCadastro>> getAllPreCadastros(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of PreCadastros");
        Page<PreCadastro> page = preCadastroRepository.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /pre-cadastros/:id} : get the "id" preCadastro.
     *
     * @param id the id of the preCadastro to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the preCadastro, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PreCadastro> getPreCadastro(@PathVariable("id") Long id) {
        LOG.debug("REST request to get PreCadastro : {}", id);
        Optional<PreCadastro> preCadastro = preCadastroRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(preCadastro);
    }

    /**
     * {@code DELETE  /pre-cadastros/:id} : delete the "id" preCadastro.
     *
     * @param id the id of the preCadastro to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePreCadastro(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete PreCadastro : {}", id);
        preCadastroRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
