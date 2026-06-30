package br.com.semear.web.rest;

import br.com.semear.domain.enumeration.NivelAcessoModulo;
import br.com.semear.service.IgrejaCargoService;
import br.com.semear.service.ModuleAccessService;
import br.com.semear.service.dto.IgrejaCargoDTO;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/igreja/cargos")
public class IgrejaCargoResource {

    private final IgrejaCargoService cargoService;
    private final ModuleAccessService moduleAccessService;

    public IgrejaCargoResource(IgrejaCargoService cargoService, ModuleAccessService moduleAccessService) {
        this.cargoService = cargoService;
        this.moduleAccessService = moduleAccessService;
    }

    @GetMapping("")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR" })
    public List<IgrejaCargoDTO> listar() {
        moduleAccessService.assertModuleAccess("configuracoes", NivelAcessoModulo.READ);
        return cargoService.listar();
    }

    @PostMapping("")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR" })
    public ResponseEntity<IgrejaCargoDTO> criar(@Valid @RequestBody IgrejaCargoDTO dto) {
        moduleAccessService.assertModuleAccess("configuracoes", NivelAcessoModulo.WRITE);
        IgrejaCargoDTO salvo = cargoService.salvar(dto);
        return ResponseEntity.created(URI.create("/api/igreja/cargos/" + salvo.getId())).body(salvo);
    }

    @PutMapping("/{id}")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR" })
    public IgrejaCargoDTO atualizar(@PathVariable Long id, @Valid @RequestBody IgrejaCargoDTO dto) {
        moduleAccessService.assertModuleAccess("configuracoes", NivelAcessoModulo.WRITE);
        dto.setId(id);
        return cargoService.salvar(dto);
    }

    @DeleteMapping("/{id}")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR" })
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("configuracoes", NivelAcessoModulo.WRITE);
        cargoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
