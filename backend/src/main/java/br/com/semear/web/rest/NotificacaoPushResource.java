package br.com.semear.web.rest;

import br.com.semear.domain.NotificacaoUsuario;
import br.com.semear.domain.User;
import br.com.semear.repository.NotificacaoUsuarioRepository;
import br.com.semear.service.PushNotificationService;
import br.com.semear.service.dto.NotificacaoPersistidaDTO;
import br.com.semear.service.dto.PushConfigPublicaDTO;
import br.com.semear.service.dto.PushDispositivoRegistroDTO;
import br.com.semear.service.dto.UsuarioPreferenciaNotificacaoDTO;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notificacoes")
public class NotificacaoPushResource {

    private final PushNotificationService pushNotificationService;
    private final NotificacaoUsuarioRepository notificacaoUsuarioRepository;
    private final br.com.semear.service.TenantService tenantService;

    public NotificacaoPushResource(
        PushNotificationService pushNotificationService,
        NotificacaoUsuarioRepository notificacaoUsuarioRepository,
        br.com.semear.service.TenantService tenantService
    ) {
        this.pushNotificationService = pushNotificationService;
        this.notificacaoUsuarioRepository = notificacaoUsuarioRepository;
        this.tenantService = tenantService;
    }

    @GetMapping("/push/config")
    public ResponseEntity<PushConfigPublicaDTO> obterConfigPush() {
        return ResponseEntity.ok(pushNotificationService.obterConfigPublica());
    }

    @PostMapping("/push/dispositivos")
    public ResponseEntity<Void> registrarDispositivo(@RequestBody PushDispositivoRegistroDTO dto) {
        pushNotificationService.registrarDispositivo(dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/push/desativar")
    public ResponseEntity<Void> desativarPush(@RequestBody(required = false) Map<String, String> body) {
        String token = body != null ? body.get("token") : null;
        pushNotificationService.desativarDispositivo(token);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/preferencias")
    public ResponseEntity<UsuarioPreferenciaNotificacaoDTO> obterPreferencias() {
        return ResponseEntity.ok(pushNotificationService.obterPreferencias());
    }

    @PutMapping("/preferencias")
    public ResponseEntity<UsuarioPreferenciaNotificacaoDTO> atualizarPreferencias(@RequestBody UsuarioPreferenciaNotificacaoDTO dto) {
        return ResponseEntity.ok(pushNotificationService.atualizarPreferencias(dto));
    }

    @PostMapping("/teste/me")
    public ResponseEntity<Void> enviarTeste() {
        pushNotificationService.enviarTesteParaUsuarioAtual();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/teste/versiculo-dia")
    public ResponseEntity<Void> enviarVersiculoDoDiaTeste() {
        pushNotificationService.enviarVersiculoDoDiaParaUsuarioAtual();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/persistidas")
    public ResponseEntity<List<NotificacaoPersistidaDTO>> listarPersistidas() {
        User user = tenantService.getUsuarioAtual();
        List<NotificacaoPersistidaDTO> lista = notificacaoUsuarioRepository.findByUserAndLidaFalseOrderByCriadoEmDesc(user).stream()
            .map(this::toDto)
            .toList();
        return ResponseEntity.ok(lista);
    }

    @PutMapping("/{id}/lida")
    public ResponseEntity<Void> marcarComoLida(@PathVariable Long id) {
        User user = tenantService.getUsuarioAtual();
        NotificacaoUsuario notificacao = notificacaoUsuarioRepository
            .findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new BadRequestAlertException("Notificação não encontrada", "notificacao", "naoencontrada"));
        notificacao.setLida(true);
        notificacaoUsuarioRepository.save(notificacao);
        return ResponseEntity.ok().build();
    }

    private NotificacaoPersistidaDTO toDto(NotificacaoUsuario n) {
        NotificacaoPersistidaDTO dto = new NotificacaoPersistidaDTO();
        dto.setId(n.getId());
        dto.setTitulo(n.getTitulo());
        dto.setMensagem(n.getMensagem());
        dto.setTipo(n.getTipo());
        dto.setLink(n.getLink());
        dto.setLida(n.getLida());
        dto.setCriadoEm(n.getCriadoEm());
        dto.setEnviadaPush(n.getEnviadaPush());
        return dto;
    }
}
