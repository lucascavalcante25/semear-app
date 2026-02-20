package br.com.semear.web.rest;

import br.com.semear.service.NotificacaoService;
import br.com.semear.service.NotificacaoService.NotificacaoItem;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
