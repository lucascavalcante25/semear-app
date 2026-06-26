package br.com.semear.service;

import br.com.semear.domain.*;
import br.com.semear.domain.enumeration.StatusEvento;
import br.com.semear.domain.enumeration.StatusInscricaoEvento;
import br.com.semear.domain.enumeration.StatusEscalaPublicacao;
import br.com.semear.repository.*;
import br.com.semear.service.dto.NotificacaoPayloadDTO;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NotificacaoEnvioService {

    private static final Logger LOG = LoggerFactory.getLogger(NotificacaoEnvioService.class);
    private static final ZoneId ZONE_BR = ZoneId.of("America/Sao_Paulo");

    private final NotificacaoUsuarioRepository notificacaoUsuarioRepository;
    private final NotificacaoEnvioLogRepository envioLogRepository;
    private final PushNotificationService pushNotificationService;
    private final TenantService tenantService;
    private final UserRepository userRepository;
    private final DepartamentoRepository departamentoRepository;
    private final DepartamentoMembroRepository departamentoMembroRepository;
    private final EscalaRepository escalaRepository;
    private final EscalaItemRepository escalaItemRepository;
    private final EventoRepository eventoRepository;
    private final EventoInscricaoRepository eventoInscricaoRepository;
    private final IgrejaRepository igrejaRepository;

    public NotificacaoEnvioService(
        NotificacaoUsuarioRepository notificacaoUsuarioRepository,
        NotificacaoEnvioLogRepository envioLogRepository,
        PushNotificationService pushNotificationService,
        TenantService tenantService,
        UserRepository userRepository,
        DepartamentoRepository departamentoRepository,
        DepartamentoMembroRepository departamentoMembroRepository,
        EscalaRepository escalaRepository,
        EscalaItemRepository escalaItemRepository,
        EventoRepository eventoRepository,
        EventoInscricaoRepository eventoInscricaoRepository,
        IgrejaRepository igrejaRepository
    ) {
        this.notificacaoUsuarioRepository = notificacaoUsuarioRepository;
        this.envioLogRepository = envioLogRepository;
        this.pushNotificationService = pushNotificationService;
        this.tenantService = tenantService;
        this.userRepository = userRepository;
        this.departamentoRepository = departamentoRepository;
        this.departamentoMembroRepository = departamentoMembroRepository;
        this.escalaRepository = escalaRepository;
        this.escalaItemRepository = escalaItemRepository;
        this.eventoRepository = eventoRepository;
        this.eventoInscricaoRepository = eventoInscricaoRepository;
        this.igrejaRepository = igrejaRepository;
    }

    public void enviarParaUsuario(Long usuarioId, NotificacaoPayloadDTO payload) {
        User user = userRepository.findById(usuarioId).orElseThrow(() -> new BadRequestAlertException("Usuário não encontrado", "user", "naoencontrado"));
        validarUsuarioIgreja(user, payload.getIgrejaId());
        if (payload.getContextoDestinatarios() == null) {
            payload.setContextoDestinatarios(descricaoUsuario(user));
        }
        enviarParaUsuariosResolvidos(List.of(user), payload);
    }

    public void enviarParaUsuarios(List<Long> usuarioIds, NotificacaoPayloadDTO payload) {
        List<User> users = new ArrayList<>();
        for (Long id : usuarioIds) {
            userRepository.findById(id).ifPresent(u -> {
                validarUsuarioIgreja(u, payload.getIgrejaId());
                users.add(u);
            });
        }
        enviarParaUsuariosResolvidos(users, payload);
    }

    public void enviarParaUsuarios(List<Long> usuarioIds, NotificacaoPayloadDTO payload, String contextoDestinatarios) {
        if (payload.getContextoDestinatarios() == null) {
            payload.setContextoDestinatarios(contextoDestinatarios);
        }
        enviarParaUsuarios(usuarioIds, payload);
    }

    public void enviarParaDepartamento(Long departamentoId, NotificacaoPayloadDTO payload) {
        Departamento departamento = departamentoRepository
            .findById(departamentoId)
            .orElseThrow(() -> new BadRequestAlertException("Departamento não encontrado", "departamento", "naoencontrado"));
        tenantService.validarMesmaIgreja(departamento.getIgreja());
        if (payload.getIgrejaId() == null) {
            payload.setIgrejaId(departamento.getIgreja().getId());
        }
        List<User> membros = departamentoMembroRepository.findByDepartamentoId(departamentoId).stream()
            .map(DepartamentoMembro::getUser)
            .filter(User::isActivated)
            .toList();
        if (payload.getContextoDestinatarios() == null) {
            payload.setContextoDestinatarios("membros do departamento \"" + departamento.getNome() + "\" (" + membros.size() + " usuário(s))");
        }
        enviarParaUsuariosResolvidos(membros, payload);
    }

    public void enviarParaEscala(Long escalaId, NotificacaoPayloadDTO payload) {
        Escala escala = escalaRepository
            .findById(escalaId)
            .orElseThrow(() -> new BadRequestAlertException("Escala não encontrada", "escala", "naoencontrada"));
        tenantService.validarMesmaIgreja(escala.getIgreja());
        if (payload.getIgrejaId() == null) {
            payload.setIgrejaId(escala.getIgreja().getId());
        }
        List<User> escalados = escalaItemRepository.findByEscalaId(escalaId).stream()
            .map(EscalaItem::getUser)
            .filter(User::isActivated)
            .toList();
        if (payload.getContextoDestinatarios() == null) {
            payload.setContextoDestinatarios("escalados em \"" + escala.getTitulo() + "\" (" + escalados.size() + " usuário(s))");
        }
        enviarParaUsuariosResolvidos(escalados, payload);
    }

    public void enviarParaInscritosEvento(Long eventoId, NotificacaoPayloadDTO payload) {
        Evento evento = eventoRepository
            .findById(eventoId)
            .orElseThrow(() -> new BadRequestAlertException("Evento não encontrado", "evento", "naoencontrado"));
        tenantService.validarMesmaIgreja(evento.getIgreja());
        if (payload.getIgrejaId() == null) {
            payload.setIgrejaId(evento.getIgreja().getId());
        }
        if (payload.getEntidadeId() == null) {
            payload.setEntidadeId(eventoId);
            payload.setEntidadeTipo("EVENTO");
        }
        List<User> inscritos = eventoInscricaoRepository.findByEventoIdAndStatus(eventoId, StatusInscricaoEvento.ATIVA).stream()
            .map(EventoInscricao::getUser)
            .filter(User::isActivated)
            .toList();
        if (payload.getContextoDestinatarios() == null) {
            payload.setContextoDestinatarios("inscritos no evento \"" + evento.getTitulo() + "\" (" + inscritos.size() + " usuário(s))");
        }
        enviarParaUsuariosResolvidos(inscritos, payload);
    }

    public void enviarParaIgreja(Long igrejaId, NotificacaoPayloadDTO payload) {
        tenantService.validarMesmaIgreja(igrejaId);
        payload.setIgrejaId(igrejaId);
        Igreja igreja = igrejaRepository.findById(igrejaId).orElseThrow(() -> new BadRequestAlertException("Igreja não encontrada", "igreja", "naoencontrada"));
        List<User> membros = userRepository.findAllByIgrejaIdAndActivatedIsTrue(igrejaId);
        if (payload.getContextoDestinatarios() == null) {
            payload.setContextoDestinatarios("TODOS os membros ativos da igreja \"" + igreja.getNome() + "\" (" + membros.size() + " usuário(s))");
        }
        enviarParaUsuariosResolvidos(membros, payload);
    }

    /** Cria notificação interna e tenta push — usado por jobs e integrações. */
    private void enviarParaUsuariosResolvidos(List<User> usuarios, NotificacaoPayloadDTO payload) {
        if (usuarios == null || usuarios.isEmpty() || payload == null) {
            return;
        }
        Igreja igreja = igrejaRepository
            .findById(payload.getIgrejaId())
            .orElseThrow(() -> new BadRequestAlertException("Igreja não encontrada", "igreja", "naoencontrada"));
        LocalDate hoje = LocalDate.now(ZONE_BR);
        Set<Long> enviados = new LinkedHashSet<>();
        int internas = 0;
        int pushEnviados = 0;
        int ignoradosDedup = 0;

        for (User user : usuarios) {
            if (user == null || user.getId() == null || !enviados.add(user.getId())) {
                continue;
            }
            if (!pertenceIgreja(user, igreja.getId())) {
                continue;
            }
            if (payload.isRegistrarDeduplicacao()) {
                String chave = payload.getChaveDeduplicacao() != null
                    ? payload.getChaveDeduplicacao()
                    : montarChaveDeduplicacao(payload.getTipo(), payload.getEntidadeTipo(), payload.getEntidadeId(), user.getId(), hoje);
                if (envioLogRepository.existsByChaveDeduplicacao(chave)) {
                    ignoradosDedup++;
                    continue;
                }
                registrarDeduplicacao(chave, igreja, user, payload, hoje);
            }
            NotificacaoUsuario notificacao = criarNotificacaoInterna(igreja, user, payload);
            internas++;
            try {
                if (pushNotificationService.tentarEnviarPush(notificacao, user)) {
                    pushEnviados++;
                }
            } catch (Exception e) {
                LOG.debug("Push falhou para usuário {} — notificação interna mantida: {}", user.getId(), e.getMessage());
            }
        }

        String destino = payload.getContextoDestinatarios() != null ? payload.getContextoDestinatarios() : usuarios.size() + " usuário(s)";
        LOG.info(
            "[NOTIFICAÇÃO] tipo={} titulo=\"{}\" | igreja={} (id={}) | destino: {} | internas={} push={} ignorados_dedup={}",
            payload.getTipo(),
            payload.getTitulo(),
            igreja.getNome(),
            igreja.getId(),
            destino,
            internas,
            pushEnviados,
            ignoradosDedup
        );
    }

    /** Após criar notificação em outro serviço, delega o push. */
    public void tentarPushAposCriacao(NotificacaoUsuario notificacao, User user) {
        if (notificacao == null || user == null) {
            return;
        }
        try {
            pushNotificationService.tentarEnviarPush(notificacao, user);
        } catch (Exception e) {
            LOG.debug("Push falhou para usuário {}: {}", user.getId(), e.getMessage());
        }
    }

    public static String montarChaveDeduplicacao(String tipo, String entidadeTipo, Long entidadeId, Long userId, LocalDate data) {
        return String.format("%s:%s:%s:%s:%s", tipo, entidadeTipo, entidadeId, userId, data);
    }

    private NotificacaoUsuario criarNotificacaoInterna(Igreja igreja, User user, NotificacaoPayloadDTO payload) {
        NotificacaoUsuario n = new NotificacaoUsuario();
        n.setIgreja(igreja);
        n.setUser(user);
        n.setTitulo(payload.getTitulo());
        n.setMensagem(payload.getMensagem());
        n.setTipo(payload.getTipo());
        n.setLink(payload.getRotaDestino());
        n.setEntidadeTipo(payload.getEntidadeTipo());
        n.setEntidadeId(payload.getEntidadeId());
        n.setLida(false);
        n.setEnviadaPush(false);
        n.setCriadoEm(Instant.now());
        return notificacaoUsuarioRepository.save(n);
    }

    private void registrarDeduplicacao(String chave, Igreja igreja, User user, NotificacaoPayloadDTO payload, LocalDate data) {
        NotificacaoEnvioLog log = new NotificacaoEnvioLog();
        log.setChaveDeduplicacao(chave);
        log.setIgreja(igreja);
        log.setUser(user);
        log.setTipo(payload.getTipo());
        log.setEntidadeTipo(payload.getEntidadeTipo());
        log.setEntidadeId(payload.getEntidadeId());
        log.setDataReferencia(data);
        log.setCriadoEm(Instant.now());
        envioLogRepository.save(log);
    }

    private void validarUsuarioIgreja(User user, Long igrejaId) {
        if (igrejaId == null) {
            return;
        }
        if (!pertenceIgreja(user, igrejaId)) {
            throw new BadRequestAlertException("Usuário não pertence à igreja", "tenant", "acessonegado");
        }
    }

    private boolean pertenceIgreja(User user, Long igrejaId) {
        return user.getIgreja() != null && igrejaId.equals(user.getIgreja().getId());
    }

    private static String descricaoUsuario(User user) {
        String nome = user.getFirstName() != null ? user.getFirstName().trim() : "";
        if (nome.isBlank()) {
            nome = user.getLogin() != null ? user.getLogin() : "sem nome";
        }
        return "usuário \"" + nome + "\" (id=" + user.getId() + ")";
    }
}
