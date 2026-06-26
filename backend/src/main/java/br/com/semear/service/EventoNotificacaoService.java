package br.com.semear.service;

import br.com.semear.domain.Evento;
import br.com.semear.domain.Igreja;
import br.com.semear.domain.NotificacaoUsuario;
import br.com.semear.domain.User;
import br.com.semear.repository.NotificacaoUsuarioRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EventoNotificacaoService {

    public static final String TIPO_EVENTO_CONFIRMACAO = "EVENTO_CONFIRMACAO";
    public static final String TIPO_EVENTO_ALTERACAO = "EVENTO_ALTERACAO";
    public static final String TIPO_EVENTO_LEMBRETE = "EVENTO_LEMBRETE";
    public static final String TIPO_EVENTO_CANCELAMENTO = "EVENTO_CANCELAMENTO";

    private static final ZoneId ZONE_BR = ZoneId.of("America/Sao_Paulo");
    private static final DateTimeFormatter DATA_HORA_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm", Locale.forLanguageTag("pt-BR"));

    private final NotificacaoUsuarioRepository notificacaoUsuarioRepository;
    private final NotificacaoEnvioService notificacaoEnvioService;

    public EventoNotificacaoService(
        NotificacaoUsuarioRepository notificacaoUsuarioRepository,
        NotificacaoEnvioService notificacaoEnvioService
    ) {
        this.notificacaoUsuarioRepository = notificacaoUsuarioRepository;
        this.notificacaoEnvioService = notificacaoEnvioService;
    }

    public void notificarConfirmacaoInscricao(Evento evento, User user) {
        criar(evento, user, TIPO_EVENTO_CONFIRMACAO, "Inscrição confirmada", "Você está inscrito em \"" + evento.getTitulo() + "\".", linkEvento(evento));
    }

    public void notificarAlteracaoEvento(Evento evento, User user, String detalhe) {
        criar(
            evento,
            user,
            TIPO_EVENTO_ALTERACAO,
            "Evento atualizado",
            "O evento \"" + evento.getTitulo() + "\" foi alterado: " + detalhe,
            linkEvento(evento)
        );
    }

    public void notificarCancelamentoEvento(Evento evento, User user) {
        criar(
            evento,
            user,
            TIPO_EVENTO_CANCELAMENTO,
            "Evento cancelado",
            "O evento \"" + evento.getTitulo() + "\" foi cancelado.",
            linkEvento(evento)
        );
    }

    public void gerarLembretesInscritos(Evento evento, List<User> inscritos) {
        if (evento.getDataInicio() == null) {
            return;
        }
        LocalDate hoje = LocalDate.now(ZONE_BR);
        LocalDate dataEvento = evento.getDataInicio().atZone(ZONE_BR).toLocalDate();
        String titulo;
        String mensagem;
        if (dataEvento.equals(hoje)) {
            titulo = "Evento hoje";
            mensagem = "Hoje: \"" + evento.getTitulo() + "\" às " + formatarHora(evento.getDataInicio()) + ".";
        } else if (dataEvento.equals(hoje.plusDays(1))) {
            titulo = "Evento amanhã";
            mensagem = "Amanhã: \"" + evento.getTitulo() + "\" às " + formatarHora(evento.getDataInicio()) + ".";
        } else {
            return;
        }
        for (User user : inscritos) {
            if (
                notificacaoUsuarioRepository.existsByUserIdAndTipoAndMensagemAndLidaFalse(
                    user.getId(),
                    TIPO_EVENTO_LEMBRETE,
                    mensagem
                )
            ) {
                continue;
            }
            criar(evento, user, TIPO_EVENTO_LEMBRETE, titulo, mensagem, linkEvento(evento));
        }
    }

    private void criar(Evento evento, User user, String tipo, String titulo, String mensagem, String link) {
        NotificacaoUsuario notificacao = new NotificacaoUsuario();
        notificacao.setIgreja(evento.getIgreja());
        notificacao.setUser(user);
        notificacao.setTipo(tipo);
        notificacao.setTitulo(titulo);
        notificacao.setMensagem(mensagem);
        notificacao.setLink(link);
        notificacao.setLida(false);
        notificacao.setCriadoEm(Instant.now());
        notificacao.setEntidadeTipo("EVENTO");
        notificacao.setEntidadeId(evento.getId());
        notificacaoUsuarioRepository.save(notificacao);
        notificacaoEnvioService.tentarPushAposCriacao(notificacao, user);
    }

    private String linkEvento(Evento evento) {
        return evento.getId() != null ? "/eventos?eventoId=" + evento.getId() : "/eventos";
    }

    private String formatarHora(Instant instant) {
        return DATA_HORA_FMT.format(instant.atZone(ZONE_BR));
    }
}
