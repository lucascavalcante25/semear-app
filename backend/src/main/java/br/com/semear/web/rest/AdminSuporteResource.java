package br.com.semear.web.rest;

import br.com.semear.domain.enumeration.PrioridadeSolicitacaoSuporte;
import br.com.semear.domain.enumeration.StatusSolicitacaoSuporte;
import br.com.semear.domain.enumeration.TipoSolicitacaoSuporte;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.SolicitacaoSuporteService;
import br.com.semear.service.dto.AtualizarStatusSolicitacaoSuporteDTO;
import br.com.semear.service.dto.EnviarMensagemSuporteDTO;
import br.com.semear.service.dto.ResponderSolicitacaoSuporteDTO;
import br.com.semear.service.dto.SolicitacaoSuporteDTO;
import br.com.semear.service.dto.SuporteResumoDTO;
import jakarta.annotation.security.RolesAllowed;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api/admin/suporte")
public class AdminSuporteResource {

    private final SolicitacaoSuporteService solicitacaoSuporteService;

    public AdminSuporteResource(SolicitacaoSuporteService solicitacaoSuporteService) {
        this.solicitacaoSuporteService = solicitacaoSuporteService;
    }

    @GetMapping("/resumo")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN })
    public SuporteResumoDTO resumo() {
        return solicitacaoSuporteService.obterResumoAdmin();
    }

    @GetMapping("/solicitacoes")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN })
    public List<SolicitacaoSuporteDTO> listar(
        @RequestParam(required = false) Long igrejaId,
        @RequestParam(required = false) StatusSolicitacaoSuporte status,
        @RequestParam(required = false) TipoSolicitacaoSuporte tipo,
        @RequestParam(required = false) PrioridadeSolicitacaoSuporte prioridade,
        @RequestParam(required = false) String busca
    ) {
        return solicitacaoSuporteService.listarAdmin(igrejaId, status, tipo, prioridade, busca);
    }

    @GetMapping("/solicitacoes/{id}")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN })
    public ResponseEntity<SolicitacaoSuporteDTO> obter(@PathVariable Long id) {
        solicitacaoSuporteService.marcarComoLidaPeloSuporte(id);
        return ResponseUtil.wrapOrNotFound(solicitacaoSuporteService.obterAdmin(id));
    }

    @PostMapping("/solicitacoes/{id}/mensagens")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN })
    public ResponseEntity<SolicitacaoSuporteDTO> enviarMensagem(@PathVariable Long id, @RequestBody EnviarMensagemSuporteDTO dto) {
        return ResponseEntity.ok(solicitacaoSuporteService.enviarMensagemSuporte(id, dto.getTexto()));
    }

    @PatchMapping("/solicitacoes/{id}/resolver")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN })
    public ResponseEntity<SolicitacaoSuporteDTO> resolver(
        @PathVariable Long id,
        @RequestBody(required = false) EnviarMensagemSuporteDTO dto
    ) {
        String msg = dto != null ? dto.getTexto() : null;
        return ResponseEntity.ok(solicitacaoSuporteService.marcarResolvidaAdmin(id, msg));
    }

    @PatchMapping("/solicitacoes/{id}/finalizar")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN })
    public ResponseEntity<SolicitacaoSuporteDTO> finalizar(
        @PathVariable Long id,
        @RequestBody(required = false) EnviarMensagemSuporteDTO dto
    ) {
        String msg = dto != null ? dto.getTexto() : null;
        return ResponseEntity.ok(solicitacaoSuporteService.finalizarAdmin(id, msg));
    }

    @PatchMapping("/solicitacoes/{id}/status")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN })
    public ResponseEntity<SolicitacaoSuporteDTO> atualizarStatus(
        @PathVariable Long id,
        @RequestBody AtualizarStatusSolicitacaoSuporteDTO dto
    ) {
        return ResponseEntity.ok(solicitacaoSuporteService.atualizarStatusAdmin(id, dto));
    }

    @PostMapping("/solicitacoes/{id}/responder")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN })
    public ResponseEntity<SolicitacaoSuporteDTO> responder(@PathVariable Long id, @RequestBody ResponderSolicitacaoSuporteDTO dto) {
        return ResponseEntity.ok(solicitacaoSuporteService.responderAdmin(id, dto));
    }

    @GetMapping("/solicitacoes/{id}/anexos/zip")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN })
    public ResponseEntity<byte[]> downloadAnexosZip(@PathVariable Long id) {
        return solicitacaoSuporteService
            .obterZipAnexos(id, true)
            .map(a -> {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(a.contentType()));
                headers.setContentDispositionFormData("attachment", a.fileName());
                return new ResponseEntity<>(a.bytes(), headers, HttpStatus.OK);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/solicitacoes/{id}/anexos/{anexoId}")
    @RolesAllowed({ AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN })
    public ResponseEntity<byte[]> downloadAnexo(
        @PathVariable Long id,
        @PathVariable Long anexoId,
        @RequestParam(defaultValue = "false") boolean inline
    ) {
        return solicitacaoSuporteService
            .obterAnexo(id, anexoId, true)
            .map(a -> {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(a.contentType()));
                if (inline) {
                    headers.setContentDisposition(
                        ContentDisposition.inline().filename(a.fileName(), StandardCharsets.UTF_8).build()
                    );
                } else {
                    headers.setContentDispositionFormData("attachment", a.fileName());
                }
                return new ResponseEntity<>(a.bytes(), headers, HttpStatus.OK);
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
