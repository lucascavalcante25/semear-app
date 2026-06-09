package br.com.semear.web.rest;

import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.IgrejaService;
import br.com.semear.service.dto.IgrejaDTO;
import br.com.semear.service.dto.IgrejaPixDTO;
import br.com.semear.service.dto.IgrejaPublicaDTO;
import jakarta.annotation.security.RolesAllowed;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api")
public class IgrejaResource {

    private static final Logger LOG = LoggerFactory.getLogger(IgrejaResource.class);

    private final IgrejaService igrejaService;

    public IgrejaResource(IgrejaService igrejaService) {
        this.igrejaService = igrejaService;
    }

    @GetMapping("/igreja-configuracao/publica")
    public ResponseEntity<IgrejaPublicaDTO> obterConfiguracaoPublica() {
        LOG.debug("REST request to get public Igreja configuration");
        Optional<IgrejaPublicaDTO> dto = igrejaService.obterConfiguracaoPublica();
        return ResponseUtil.wrapOrNotFound(dto);
    }

    @GetMapping("/igreja/atual")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.TESOURARIA,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.MEMBRO,
        AuthoritiesConstants.VISITANTE,
    })
    public ResponseEntity<IgrejaDTO> obterIgrejaAtual() {
        LOG.debug("REST request to get current Igreja");
        Optional<IgrejaDTO> dto = igrejaService.obterIgrejaAtualDoUsuario();
        return ResponseUtil.wrapOrNotFound(dto);
    }

    @PutMapping("/igreja/atual")
    @RolesAllowed({ AuthoritiesConstants.ADMIN, AuthoritiesConstants.ADMIN_IGREJA })
    public ResponseEntity<IgrejaDTO> atualizarIgrejaAtual(@RequestBody IgrejaDTO dto) {
        LOG.debug("REST request to update current Igreja : {}", dto);
        return ResponseEntity.ok(igrejaService.atualizarIgrejaAtual(dto));
    }

    @GetMapping("/igreja/configuracao")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.TESOURARIA,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.MEMBRO,
        AuthoritiesConstants.VISITANTE,
    })
    public ResponseEntity<IgrejaDTO> obterConfiguracao() {
        return obterIgrejaAtual();
    }

    @PutMapping("/igreja/configuracao")
    @RolesAllowed({ AuthoritiesConstants.ADMIN, AuthoritiesConstants.ADMIN_IGREJA })
    public ResponseEntity<IgrejaDTO> atualizarConfiguracao(@RequestBody IgrejaDTO dto) {
        LOG.debug("REST request to update Igreja configuration : {}", dto);
        return ResponseEntity.ok(igrejaService.atualizarConfiguracao(dto));
    }

    @GetMapping("/igreja/pix")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.TESOURARIA,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.MEMBRO,
        AuthoritiesConstants.VISITANTE,
    })
    public ResponseEntity<IgrejaPixDTO> obterPix() {
        LOG.debug("REST request to get Igreja PIX");
        Optional<IgrejaPixDTO> dto = igrejaService.obterPixAtual();
        return ResponseUtil.wrapOrNotFound(dto);
    }

    @PutMapping("/igreja/pix")
    @RolesAllowed({ AuthoritiesConstants.ADMIN, AuthoritiesConstants.ADMIN_IGREJA })
    public ResponseEntity<IgrejaPixDTO> atualizarPix(@RequestBody IgrejaPixDTO dto) {
        LOG.debug("REST request to update Igreja PIX : {}", dto);
        return ResponseEntity.ok(igrejaService.atualizarPix(dto));
    }

    @GetMapping("/igreja/identidade-visual")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.TESOURARIA,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.MEMBRO,
        AuthoritiesConstants.VISITANTE,
    })
    public ResponseEntity<IgrejaDTO> obterIdentidadeVisual() {
        return obterIgrejaAtual();
    }

    @PutMapping("/igreja/identidade-visual")
    @RolesAllowed({ AuthoritiesConstants.ADMIN, AuthoritiesConstants.ADMIN_IGREJA })
    public ResponseEntity<IgrejaDTO> atualizarIdentidadeVisual(@RequestBody IgrejaDTO dto) {
        LOG.debug("REST request to update Igreja visual identity : {}", dto);
        return ResponseEntity.ok(igrejaService.atualizarIdentidadeVisual(dto));
    }

    @PostMapping("/igreja/logo")
    @RolesAllowed({ AuthoritiesConstants.ADMIN, AuthoritiesConstants.ADMIN_IGREJA })
    public ResponseEntity<IgrejaDTO> uploadLogo(@RequestParam("file") MultipartFile file) {
        LOG.debug("REST request to upload Igreja logo");
        return ResponseEntity.ok(igrejaService.uploadLogo(file));
    }

    @GetMapping("/igrejas/{id}/logo")
    public ResponseEntity<byte[]> obterLogo(@PathVariable Long id) {
        return igrejaService
            .obterLogo(id)
            .map(logo ->
                ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(logo.contentType()))
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                    .body(logo.bytes())
            )
            .orElse(ResponseEntity.notFound().build());
    }
}
