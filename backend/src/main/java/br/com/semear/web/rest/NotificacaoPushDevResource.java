package br.com.semear.web.rest;

import br.com.semear.service.PushLembreteScheduler;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Endpoints de disparo manual — apenas perfil {@code dev}. */
@RestController
@Profile("dev")
@RequestMapping("/api/notificacoes/dev")
public class NotificacaoPushDevResource {

    private final PushLembreteScheduler pushLembreteScheduler;

    public NotificacaoPushDevResource(PushLembreteScheduler pushLembreteScheduler) {
        this.pushLembreteScheduler = pushLembreteScheduler;
    }

    /** Executa imediatamente o mesmo job agendado do versículo do dia (todos com push ativo). */
    @PostMapping("/disparar-versiculo-dia")
    public ResponseEntity<Void> dispararVersiculoDoDia() {
        pushLembreteScheduler.executarDisparoVersiculoDoDia();
        return ResponseEntity.ok().build();
    }
}
