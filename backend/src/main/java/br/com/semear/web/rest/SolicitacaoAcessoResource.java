package br.com.semear.web.rest;

import br.com.semear.domain.enumeration.StatusSolicitacaoAcesso;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.SolicitacaoAcessoService;
import br.com.semear.service.dto.SolicitacaoAcessoDTO;
import jakarta.annotation.security.RolesAllowed;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api")
public class SolicitacaoAcessoResource {

    private final SolicitacaoAcessoService solicitacaoAcessoService;

    public SolicitacaoAcessoResource(SolicitacaoAcessoService solicitacaoAcessoService) {
        this.solicitacaoAcessoService = solicitacaoAcessoService;
    }

    @PostMapping("/solicitacoes-acesso")
    public ResponseEntity<SolicitacaoAcessoDTO> criar(@RequestBody SolicitacaoAcessoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(solicitacaoAcessoService.criarPublica(dto));
    }

    @GetMapping("/admin/solicitacoes")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN })
    public List<SolicitacaoAcessoDTO> listar(@RequestParam(required = false) StatusSolicitacaoAcesso status) {
        return solicitacaoAcessoService.listar(status);
    }

    @GetMapping("/admin/solicitacoes/{id}")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN })
    public ResponseEntity<SolicitacaoAcessoDTO> obter(@PathVariable Long id) {
        Optional<SolicitacaoAcessoDTO> dto = solicitacaoAcessoService.findOne(id);
        return ResponseUtil.wrapOrNotFound(dto);
    }

    @PostMapping("/admin/solicitacoes/{id}/aprovar")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN })
    public ResponseEntity<SolicitacaoAcessoDTO> aprovar(
        @PathVariable Long id,
        @RequestBody(required = false) Map<String, String> body
    ) {
        String obs = body != null ? body.get("observacaoAdmin") : null;
        return ResponseEntity.ok(solicitacaoAcessoService.aprovar(id, obs));
    }

    @PostMapping("/admin/solicitacoes/{id}/rejeitar")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN })
    public ResponseEntity<SolicitacaoAcessoDTO> rejeitar(
        @PathVariable Long id,
        @RequestBody(required = false) Map<String, String> body
    ) {
        String obs = body != null ? body.get("observacaoAdmin") : null;
        return ResponseEntity.ok(solicitacaoAcessoService.rejeitar(id, obs));
    }
}
