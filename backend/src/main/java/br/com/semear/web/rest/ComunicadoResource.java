package br.com.semear.web.rest;

import br.com.semear.domain.enumeration.NivelAcessoModulo;
import br.com.semear.service.ComunicadoService;
import br.com.semear.service.ModuleAccessService;
import br.com.semear.service.dto.ComunicadoDTO;
import br.com.semear.service.dto.ComunicadoLeituraDTO;
import jakarta.annotation.security.RolesAllowed;
import java.net.URI;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;

@RestController
@RequestMapping("/api/comunicados")
public class ComunicadoResource {

    private final ComunicadoService comunicadoService;
    private final ModuleAccessService moduleAccessService;

    public ComunicadoResource(ComunicadoService comunicadoService, ModuleAccessService moduleAccessService) {
        this.comunicadoService = comunicadoService;
        this.moduleAccessService = moduleAccessService;
    }

    @GetMapping("")
    public ResponseEntity<List<ComunicadoDTO>> listar(
        @RequestParam(name = "ativos", required = false, defaultValue = "true") boolean ativos,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        moduleAccessService.assertModuleAccess("comunicados", NivelAcessoModulo.READ);
        Page<ComunicadoDTO> page = comunicadoService.listar(pageable, ativos);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        List<ComunicadoDTO> body = page.getContent().stream().map(this::enriquecerCriadoPor).toList();
        return ResponseEntity.ok().headers(headers).body(body);
    }

    @GetMapping("/{id}")
    public ComunicadoDTO obter(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("comunicados", NivelAcessoModulo.READ);
        return enriquecerCriadoPor(comunicadoService.obter(id));
    }

    @PostMapping("")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA" })
    public ResponseEntity<ComunicadoDTO> criar(@RequestBody ComunicadoDTO dto) {
        moduleAccessService.assertModuleAccess("comunicados", NivelAcessoModulo.WRITE);
        ComunicadoDTO result = comunicadoService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).location(URI.create("/api/comunicados/" + result.getId())).body(result);
    }

    @PutMapping("/{id}")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA" })
    public ComunicadoDTO atualizar(@PathVariable Long id, @RequestBody ComunicadoDTO dto) {
        moduleAccessService.assertModuleAccess("comunicados", NivelAcessoModulo.WRITE);
        return comunicadoService.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA" })
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("comunicados", NivelAcessoModulo.WRITE);
        comunicadoService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/pendentes-login")
    public List<ComunicadoDTO> listarPendentesLogin() {
        moduleAccessService.assertModuleAccess("comunicados", NivelAcessoModulo.READ);
        return comunicadoService.listarPendentesLogin();
    }

    @GetMapping("/banner")
    public List<ComunicadoDTO> listarBanner() {
        moduleAccessService.assertModuleAccess("comunicados", NivelAcessoModulo.READ);
        return comunicadoService.listarBanner();
    }

    @PostMapping("/{id}/confirmar")
    public ComunicadoDTO confirmar(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("comunicados", NivelAcessoModulo.READ);
        return comunicadoService.confirmarLeitura(id);
    }

    @GetMapping("/{id}/leituras")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA" })
    public List<ComunicadoLeituraDTO> listarLeituras(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("comunicados", NivelAcessoModulo.READ);
        return comunicadoService.listarLeituras(id);
    }

    private ComunicadoDTO enriquecerCriadoPor(ComunicadoDTO dto) {
        if (dto != null && dto.getCriadoPor() != null) {
            dto.setCriadoPor(comunicadoService.resolverCriadoPorDisplayName(dto.getCriadoPor()));
        }
        return dto;
    }
}
