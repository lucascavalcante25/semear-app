package br.com.semear.web.rest;

import br.com.semear.service.NotificacaoService;
import br.com.semear.service.NotificacaoService.NotificacaoItem;
import br.com.semear.service.dto.NotificacaoResumoDTO;
import br.com.semear.service.dto.NotificacaoContagemDTO;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notificacoes")
public class NotificacaoResource {

    private static final Logger LOG = LoggerFactory.getLogger(NotificacaoResource.class);

    private final NotificacaoService notificacaoService;

    public NotificacaoResource(NotificacaoService notificacaoService) {
        this.notificacaoService = notificacaoService;
    }

    @GetMapping("")
    public ResponseEntity<List<NotificacaoItem>> listarNaoVistas() {
        List<NotificacaoItem> itens = notificacaoService.listarNaoVistas();
        return ResponseEntity.ok(itens);
    }

    @GetMapping("/resumo")
    public ResponseEntity<NotificacaoResumoDTO> obterResumo(
        @RequestHeader(value = "If-None-Match", required = false) String ifNoneMatch
    ) {
        Optional<String> fingerprint = notificacaoService.obterFingerprintAtual();
        if (fingerprint.isPresent() && Objects.equals(fingerprint.get(), normalizarEtag(ifNoneMatch))) {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).eTag(fingerprint.get()).build();
        }
        NotificacaoResumoDTO resumo = notificacaoService.obterResumo();
        String etag = notificacaoService.obterFingerprintAtual().orElse(null);
        if (etag == null) {
            return ResponseEntity.ok(resumo);
        }
        return ResponseEntity.ok().eTag(etag).body(resumo);
    }

    @GetMapping("/contagem")
    public ResponseEntity<NotificacaoContagemDTO> obterContagem(
        @RequestHeader(value = "If-None-Match", required = false) String ifNoneMatch
    ) {
        Optional<String> fingerprint = notificacaoService.obterFingerprintAtual();
        if (fingerprint.isPresent() && Objects.equals(fingerprint.get(), normalizarEtag(ifNoneMatch))) {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).eTag(fingerprint.get()).build();
        }
        NotificacaoContagemDTO contagem = notificacaoService.obterContagem();
        String etag = contagem.getFingerprint();
        if (etag == null || etag.isBlank()) {
            return ResponseEntity.ok(contagem);
        }
        return ResponseEntity.ok().eTag(etag).body(contagem);
    }

    private static String normalizarEtag(String etag) {
        if (etag == null || etag.isBlank()) {
            return null;
        }
        return etag.replace("\"", "").trim();
    }

    @PostMapping("/marcar-vista")
    public ResponseEntity<Void> marcarComoVista(@RequestBody Map<String, Object> body) {
        String tipo = (String) body.get("tipo");
        Object refObj = body.get("referenciaId");
        if (tipo == null || refObj == null) {
            return ResponseEntity.badRequest().build();
        }
        Long referenciaId = refObj instanceof Number ? ((Number) refObj).longValue() : Long.parseLong(refObj.toString());
        notificacaoService.marcarComoVista(tipo, referenciaId);
        return ResponseEntity.ok().build();
    }
}
