package br.com.semear.web.rest;

import br.com.semear.domain.enumeration.NivelAcessoModulo;
import br.com.semear.service.ArtistaLouvorService;
import br.com.semear.service.LouvorConteudoService;
import br.com.semear.service.LouvorService;
import br.com.semear.service.ModuleAccessService;
import br.com.semear.security.SecurityUtils;
import br.com.semear.service.dto.LouvorCifraApiDTO;
import br.com.semear.service.dto.LouvorDTO;
import br.com.semear.service.dto.LouvorLetraDTO;
import br.com.semear.service.dto.LouvorSalvarCifraDTO;
import br.com.semear.service.dto.LouvorSalvarLetraDTO;
import br.com.semear.service.dto.LouvorTonalidadeDTO;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller para gerenciar Louvores.
 */
@RestController
@RequestMapping("/api/louvores")
@Transactional
public class LouvorResource {

    private static final Logger log = LoggerFactory.getLogger(LouvorResource.class);
    private static final String ENTITY_NAME = "louvor";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final LouvorService louvorService;
    private final ModuleAccessService moduleAccessService;
    private final ArtistaLouvorService artistaLouvorService;
    private final LouvorConteudoService louvorConteudoService;

    public LouvorResource(
        LouvorService louvorService,
        ModuleAccessService moduleAccessService,
        ArtistaLouvorService artistaLouvorService,
        LouvorConteudoService louvorConteudoService
    ) {
        this.louvorService = louvorService;
        this.moduleAccessService = moduleAccessService;
        this.artistaLouvorService = artistaLouvorService;
        this.louvorConteudoService = louvorConteudoService;
    }

    @PostMapping("")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA", "ROLE_MEMBRO"})
    public ResponseEntity<LouvorDTO> createLouvor(@Valid @RequestBody LouvorDTO louvorDTO) throws URISyntaxException {
        moduleAccessService.assertModuleAccess("louvores", NivelAcessoModulo.WRITE);
        log.debug("REST request to create Louvor : {}", louvorDTO);
        if (louvorDTO.getId() != null) {
            throw new BadRequestAlertException("A new louvor cannot already have an ID", ENTITY_NAME, "idexists");
        }
        LouvorDTO result = louvorService.save(louvorDTO);
        return ResponseEntity.created(new URI("/api/louvores/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @PutMapping("/{id}")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA", "ROLE_MEMBRO"})
    public ResponseEntity<LouvorDTO> updateLouvor(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody LouvorDTO louvorDTO
    ) throws URISyntaxException {
        moduleAccessService.assertModuleAccess("louvores", NivelAcessoModulo.WRITE);
        log.debug("REST request to update Louvor : {}, {}", id, louvorDTO);
        if (louvorDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, louvorDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        Optional<LouvorDTO> existing = louvorService.findOne(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        LouvorDTO result = louvorService.save(louvorDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @GetMapping("")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<LouvorDTO>> getAllLouvores(
        @RequestParam(required = false) String q
    ) {
        if (SecurityUtils.isAuthenticated()) {
            moduleAccessService.assertModuleAccess("louvores", NivelAcessoModulo.READ);
        }
        log.debug("REST request to get Louvores");
        List<LouvorDTO> list = q != null && !q.isBlank()
            ? louvorService.search(q.trim())
            : louvorService.findAll();
        return ResponseEntity.ok().body(list);
    }

    @GetMapping("/artistas")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<String>> getArtistas(@RequestParam(required = false) String q) {
        if (SecurityUtils.isAuthenticated()) {
            moduleAccessService.assertModuleAccess("louvores", NivelAcessoModulo.READ);
        }
        log.debug("REST request to get artistas de louvor, q={}", q);
        return ResponseEntity.ok(artistaLouvorService.listarNomes(q));
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<LouvorDTO> getLouvor(@PathVariable Long id) {
        if (SecurityUtils.isAuthenticated()) {
            moduleAccessService.assertModuleAccess("louvores", NivelAcessoModulo.READ);
        }
        log.debug("REST request to get Louvor : {}", id);
        Optional<LouvorDTO> louvorDTO = louvorService.findOne(id);
        return ResponseUtil.wrapOrNotFound(louvorDTO);
    }

    @GetMapping("/{id}/letra")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LouvorLetraDTO> getLetra(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("louvores", NivelAcessoModulo.READ);
        log.debug("REST request to get letra for Louvor : {}", id);
        return ResponseEntity.ok(louvorConteudoService.obterLetra(id));
    }

    @GetMapping("/{id}/cifra-online")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LouvorCifraApiDTO> getCifraOnline(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("louvores", NivelAcessoModulo.READ);
        log.debug("REST request to get cifra online for Louvor : {}", id);
        return ResponseEntity.ok(louvorConteudoService.obterCifraApi(id));
    }

    @PutMapping("/{id}/letra")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA", "ROLE_MEMBRO"})
    public ResponseEntity<LouvorLetraDTO> salvarLetraManual(
        @PathVariable Long id,
        @Valid @RequestBody LouvorSalvarLetraDTO body
    ) {
        moduleAccessService.assertModuleAccess("louvores", NivelAcessoModulo.WRITE);
        log.debug("REST request to save manual letra for Louvor : {}", id);
        return ResponseEntity.ok(louvorConteudoService.salvarLetraManual(id, body.getTexto()));
    }

    @PutMapping("/{id}/cifra-online")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA", "ROLE_MEMBRO"})
    public ResponseEntity<LouvorCifraApiDTO> salvarCifraManual(
        @PathVariable Long id,
        @Valid @RequestBody LouvorSalvarCifraDTO body
    ) {
        moduleAccessService.assertModuleAccess("louvores", NivelAcessoModulo.WRITE);
        log.debug("REST request to save manual cifra for Louvor : {}", id);
        return ResponseEntity.ok(louvorConteudoService.salvarCifraManual(id, body.getTexto()));
    }

    @PatchMapping("/{id}/tonalidade")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA", "ROLE_MEMBRO"})
    public ResponseEntity<LouvorDTO> atualizarTonalidade(
        @PathVariable Long id,
        @Valid @RequestBody LouvorTonalidadeDTO body
    ) {
        moduleAccessService.assertModuleAccess("louvores", NivelAcessoModulo.WRITE);
        log.debug("REST request to update tonalidade for Louvor : {}", id);
        LouvorDTO result = louvorService.atualizarTonalidade(id, body.getTonalidade());
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .body(result);
    }

    @DeleteMapping("/{id}")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA", "ROLE_MEMBRO"})
    public ResponseEntity<Void> deleteLouvor(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("louvores", NivelAcessoModulo.WRITE);
        log.debug("REST request to delete Louvor : {}", id);
        louvorService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
