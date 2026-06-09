package br.com.semear.web.rest;

import br.com.semear.domain.enumeration.StatusIgreja;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.IgrejaService;
import br.com.semear.service.dto.IgrejaDTO;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import jakarta.annotation.security.RolesAllowed;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api/admin/igrejas")
public class AdminIgrejaResource {

    private static final Logger LOG = LoggerFactory.getLogger(AdminIgrejaResource.class);
    private static final String ENTITY_NAME = "igreja";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final IgrejaService igrejaService;

    public AdminIgrejaResource(IgrejaService igrejaService) {
        this.igrejaService = igrejaService;
    }

    @GetMapping("")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN })
    public List<IgrejaDTO> listar(
        @RequestParam(required = false) String nome,
        @RequestParam(required = false) String cnpj,
        @RequestParam(required = false) String cidade,
        @RequestParam(required = false) StatusIgreja status
    ) {
        LOG.debug("REST request to list Igrejas");
        return igrejaService.buscarComFiltros(nome, cnpj, cidade, status);
    }

    @GetMapping("/{id}")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN })
    public ResponseEntity<IgrejaDTO> obter(@PathVariable Long id) {
        LOG.debug("REST request to get Igreja : {}", id);
        Optional<IgrejaDTO> dto = igrejaService.findOne(id);
        return ResponseUtil.wrapOrNotFound(dto);
    }

    @PostMapping("")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN })
    public ResponseEntity<IgrejaDTO> criar(@RequestBody IgrejaDTO dto) throws URISyntaxException {
        LOG.debug("REST request to create Igreja : {}", dto);
        if (dto.getId() != null) {
            throw new BadRequestAlertException("Nova igreja não pode ter ID", ENTITY_NAME, "idexists");
        }
        IgrejaDTO result = igrejaService.salvar(dto);
        return ResponseEntity.created(new URI("/api/admin/igrejas/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @PutMapping("/{id}")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN })
    public ResponseEntity<IgrejaDTO> atualizar(@PathVariable Long id, @RequestBody IgrejaDTO dto) {
        LOG.debug("REST request to update Igreja : {}, {}", id, dto);
        if (dto.getId() == null) {
            dto.setId(id);
        }
        if (!Objects.equals(id, dto.getId())) {
            throw new BadRequestAlertException("ID inválido", ENTITY_NAME, "idinvalid");
        }
        return ResponseEntity.ok(igrejaService.salvar(dto));
    }

    @PatchMapping("/{id}/ativar")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN })
    public ResponseEntity<IgrejaDTO> ativar(@PathVariable Long id) {
        return ResponseEntity.ok(igrejaService.ativar(id));
    }

    @PatchMapping("/{id}/inativar")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN })
    public ResponseEntity<IgrejaDTO> inativar(@PathVariable Long id) {
        return ResponseEntity.ok(igrejaService.inativar(id));
    }

    @PatchMapping("/{id}/teste")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN })
    public ResponseEntity<IgrejaDTO> colocarEmTeste(@PathVariable Long id) {
        return ResponseEntity.ok(igrejaService.colocarEmTeste(id));
    }
}
