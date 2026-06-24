package br.com.semear.web.rest;

import br.com.semear.domain.enumeration.CategoriaPedidoOracao;
import br.com.semear.domain.enumeration.NivelAcessoModulo;
import br.com.semear.domain.enumeration.StatusPedidoOracao;
import br.com.semear.service.ModuleAccessService;
import br.com.semear.service.PedidoOracaoService;
import br.com.semear.service.dto.PedidoOracaoAtualizarDTO;
import br.com.semear.service.dto.PedidoOracaoCriarDTO;
import br.com.semear.service.dto.PedidoOracaoDTO;
import br.com.semear.service.dto.PedidoOracaoResponderDTO;
import jakarta.annotation.security.RolesAllowed;
import java.net.URI;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api/pedidos-oracao")
public class PedidoOracaoResource {

    private final PedidoOracaoService pedidoOracaoService;
    private final ModuleAccessService moduleAccessService;

    public PedidoOracaoResource(PedidoOracaoService pedidoOracaoService, ModuleAccessService moduleAccessService) {
        this.pedidoOracaoService = pedidoOracaoService;
        this.moduleAccessService = moduleAccessService;
    }

    @PostMapping("")
    public ResponseEntity<PedidoOracaoDTO> criar(@RequestBody PedidoOracaoCriarDTO dto) {
        moduleAccessService.assertModuleAccess("oracao", NivelAcessoModulo.WRITE);
        PedidoOracaoDTO result = pedidoOracaoService.criar(dto);
        return ResponseEntity.created(URI.create("/api/pedidos-oracao/" + result.getId())).body(result);
    }

    @GetMapping("")
    public ResponseEntity<Page<PedidoOracaoDTO>> listarMural(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(required = false) CategoriaPedidoOracao categoria,
        @RequestParam(required = false) StatusPedidoOracao status
    ) {
        moduleAccessService.assertModuleAccess("oracao", NivelAcessoModulo.READ);
        Page<PedidoOracaoDTO> page = pedidoOracaoService.listarMural(pageable, categoria, status);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page);
    }

    @GetMapping("/meus")
    public ResponseEntity<Page<PedidoOracaoDTO>> listarMeus(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        moduleAccessService.assertModuleAccess("oracao", NivelAcessoModulo.READ);
        Page<PedidoOracaoDTO> page = pedidoOracaoService.listarMeus(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page);
    }

    @GetMapping("/lideranca")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA" })
    public ResponseEntity<Page<PedidoOracaoDTO>> listarLideranca(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(required = false) CategoriaPedidoOracao categoria,
        @RequestParam(required = false) StatusPedidoOracao status
    ) {
        moduleAccessService.assertModuleAccess("oracao", NivelAcessoModulo.READ);
        Page<PedidoOracaoDTO> page = pedidoOracaoService.listarLideranca(pageable, categoria, status);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoOracaoDTO> obter(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("oracao", NivelAcessoModulo.READ);
        return ResponseUtil.wrapOrNotFound(pedidoOracaoService.obter(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PedidoOracaoDTO> atualizar(@PathVariable Long id, @RequestBody PedidoOracaoAtualizarDTO dto) {
        moduleAccessService.assertModuleAccess("oracao", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(pedidoOracaoService.atualizar(id, dto));
    }

    @PatchMapping("/{id}/aprovar")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA" })
    public ResponseEntity<PedidoOracaoDTO> aprovar(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("oracao", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(pedidoOracaoService.aprovar(id));
    }

    @PatchMapping("/{id}/rejeitar")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA" })
    public ResponseEntity<PedidoOracaoDTO> rejeitar(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("oracao", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(pedidoOracaoService.rejeitar(id));
    }

    @PatchMapping("/{id}/responder")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA" })
    public ResponseEntity<PedidoOracaoDTO> responder(@PathVariable Long id, @RequestBody PedidoOracaoResponderDTO dto) {
        moduleAccessService.assertModuleAccess("oracao", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(pedidoOracaoService.responder(id, dto));
    }

    @PatchMapping("/{id}/encerrar")
    public ResponseEntity<PedidoOracaoDTO> encerrar(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("oracao", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(pedidoOracaoService.encerrar(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("oracao", NivelAcessoModulo.WRITE);
        pedidoOracaoService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/orei")
    public ResponseEntity<PedidoOracaoDTO> registrarIntercessao(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("oracao", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(pedidoOracaoService.registrarIntercessao(id));
    }

    @DeleteMapping("/{id}/orei")
    public ResponseEntity<Void> removerIntercessao(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("oracao", NivelAcessoModulo.WRITE);
        pedidoOracaoService.removerIntercessao(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/denunciar")
    public ResponseEntity<PedidoOracaoDTO> denunciar(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("oracao", NivelAcessoModulo.READ);
        return ResponseEntity.ok(pedidoOracaoService.denunciar(id));
    }
}
