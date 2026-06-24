package br.com.semear.web.rest;

import br.com.semear.domain.Endereco;
import br.com.semear.repository.EnderecoRepository;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
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

@RestController
@RequestMapping("/api/enderecos")
@Transactional
public class EnderecoResource {

    private static final Logger LOG = LoggerFactory.getLogger(EnderecoResource.class);
    private static final String ENTITY_NAME = "endereco";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final EnderecoRepository enderecoRepository;

    public EnderecoResource(EnderecoRepository enderecoRepository) {
        this.enderecoRepository = enderecoRepository;
    }

    @PostMapping("")
    @RolesAllowed({ AuthoritiesConstants.ADMIN, AuthoritiesConstants.ADMIN_IGREJA, AuthoritiesConstants.SECRETARIA })
    public ResponseEntity<Endereco> createEndereco(@Valid @RequestBody Endereco endereco) throws URISyntaxException {
        LOG.debug("REST request to save Endereco : {}", endereco);
        if (endereco.getId() != null) {
            throw new BadRequestAlertException("A new endereco cannot already have an ID", ENTITY_NAME, "idexists");
        }
        endereco = enderecoRepository.save(endereco);
        return ResponseEntity.created(new URI("/api/enderecos/" + endereco.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, endereco.getId().toString()))
            .body(endereco);
    }

    @PutMapping("/{id}")
    @RolesAllowed({ AuthoritiesConstants.ADMIN, AuthoritiesConstants.ADMIN_IGREJA, AuthoritiesConstants.SECRETARIA })
    public ResponseEntity<Endereco> updateEndereco(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody Endereco endereco
    ) throws URISyntaxException {
        LOG.debug("REST request to update Endereco : {}, {}", id, endereco);
        if (endereco.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, endereco.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        if (!enderecoRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }
        endereco = enderecoRepository.save(endereco);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, endereco.getId().toString()))
            .body(endereco);
    }

    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @RolesAllowed({ AuthoritiesConstants.ADMIN, AuthoritiesConstants.ADMIN_IGREJA, AuthoritiesConstants.SECRETARIA })
    public ResponseEntity<Endereco> partialUpdateEndereco(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Endereco endereco
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Endereco partially : {}, {}", id, endereco);
        if (endereco.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, endereco.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        if (!enderecoRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Endereco> result = enderecoRepository
            .findById(endereco.getId())
            .map(existingEndereco -> {
                if (endereco.getLogradouro() != null) {
                    existingEndereco.setLogradouro(endereco.getLogradouro());
                }
                if (endereco.getNumero() != null) {
                    existingEndereco.setNumero(endereco.getNumero());
                }
                if (endereco.getComplemento() != null) {
                    existingEndereco.setComplemento(endereco.getComplemento());
                }
                if (endereco.getBairro() != null) {
                    existingEndereco.setBairro(endereco.getBairro());
                }
                if (endereco.getCidade() != null) {
                    existingEndereco.setCidade(endereco.getCidade());
                }
                if (endereco.getEstado() != null) {
                    existingEndereco.setEstado(endereco.getEstado());
                }
                if (endereco.getCep() != null) {
                    existingEndereco.setCep(endereco.getCep());
                }
                return existingEndereco;
            })
            .map(enderecoRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, endereco.getId().toString())
        );
    }

    @GetMapping("/{id}")
    @RolesAllowed({ AuthoritiesConstants.ADMIN, AuthoritiesConstants.ADMIN_IGREJA, AuthoritiesConstants.SECRETARIA })
    public ResponseEntity<Endereco> getEndereco(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Endereco : {}", id);
        Optional<Endereco> endereco = enderecoRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(endereco);
    }

    @DeleteMapping("/{id}")
    @RolesAllowed({ AuthoritiesConstants.ADMIN, AuthoritiesConstants.ADMIN_IGREJA, AuthoritiesConstants.SECRETARIA })
    public ResponseEntity<Void> deleteEndereco(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Endereco : {}", id);
        enderecoRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
