package br.com.semear.service;

import br.com.semear.config.PushNotificationProperties;
import br.com.semear.domain.Igreja;
import br.com.semear.domain.NotificacaoUsuario;
import br.com.semear.domain.UsuarioDispositivoPush;
import br.com.semear.domain.UsuarioPreferenciaNotificacao;
import br.com.semear.domain.User;
import br.com.semear.domain.enumeration.PlataformaPush;
import br.com.semear.repository.NotificacaoUsuarioRepository;
import br.com.semear.repository.UsuarioDispositivoPushRepository;
import br.com.semear.repository.UsuarioPreferenciaNotificacaoRepository;
import br.com.semear.service.dto.PushConfigPublicaDTO;
import br.com.semear.service.dto.PushDispositivoRegistroDTO;
import br.com.semear.service.dto.UsuarioPreferenciaNotificacaoDTO;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.MessagingErrorCode;
import com.google.firebase.messaging.Notification;
import java.time.Instant;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PushNotificationService {

    private static final Logger LOG = LoggerFactory.getLogger(PushNotificationService.class);
    private static final ZoneId ZONE_BR = ZoneId.of("America/Sao_Paulo");
    private static final LocalTime MADRUGADA_INICIO = LocalTime.of(22, 0);
    private static final LocalTime MADRUGADA_FIM = LocalTime.of(6, 0);

    private final PushNotificationProperties pushProperties;
    private final UsuarioDispositivoPushRepository dispositivoRepository;
    private final UsuarioPreferenciaNotificacaoRepository preferenciaRepository;
    private final NotificacaoUsuarioRepository notificacaoUsuarioRepository;
    private final TenantService tenantService;

    public PushNotificationService(
        PushNotificationProperties pushProperties,
        UsuarioDispositivoPushRepository dispositivoRepository,
        UsuarioPreferenciaNotificacaoRepository preferenciaRepository,
        NotificacaoUsuarioRepository notificacaoUsuarioRepository,
        TenantService tenantService
    ) {
        this.pushProperties = pushProperties;
        this.dispositivoRepository = dispositivoRepository;
        this.preferenciaRepository = preferenciaRepository;
        this.notificacaoUsuarioRepository = notificacaoUsuarioRepository;
        this.tenantService = tenantService;
    }

    @Transactional(readOnly = true)
    public PushConfigPublicaDTO obterConfigPublica() {
        PushConfigPublicaDTO dto = new PushConfigPublicaDTO();
        dto.setDisponivel(pushProperties.isOperational());
        dto.setVapidPublicKey(pushProperties.getVapidPublicKey());
        dto.setFirebaseProjectId(pushProperties.getFirebaseProjectId());
        return dto;
    }

    public boolean isEnabled() {
        return pushProperties.isOperational();
    }

    public UsuarioDispositivoPush registrarDispositivo(PushDispositivoRegistroDTO dto) {
        if (!pushProperties.isEnabled()) {
            throw new BadRequestAlertException("Push notifications desabilitado", "push", "desabilitado");
        }
        if (dto.getToken() == null || dto.getToken().isBlank()) {
            throw new BadRequestAlertException("Token obrigatório", "push", "tokenobrigatorio");
        }
        User user = tenantService.getUsuarioAtual();
        Igreja igreja = tenantService.getIgrejaAtual();
        tenantService.validarMesmaIgreja(igreja);

        UsuarioDispositivoPush dispositivo = dispositivoRepository
            .findByUserIdAndToken(user.getId(), dto.getToken())
            .orElseGet(UsuarioDispositivoPush::new);

        dispositivo.setIgreja(igreja);
        dispositivo.setUser(user);
        dispositivo.setToken(dto.getToken().trim());
        dispositivo.setPlataforma(resolverPlataforma(dto.getPlataforma()));
        dispositivo.setNavegador(dto.getNavegador());
        dispositivo.setUserAgent(truncar(dto.getUserAgent(), 500));
        dispositivo.setAtivo(true);
        dispositivo.setDesativadoEm(null);
        dispositivo.setAtualizadoEm(Instant.now());
        if (dispositivo.getCriadoEm() == null) {
            dispositivo.setCriadoEm(Instant.now());
        }
        dispositivo.setUltimoUso(Instant.now());

        UsuarioPreferenciaNotificacao pref = obterOuCriarPreferencias(user, igreja);
        pref.setPushAtivo(true);
        pref.setAtualizadoEm(Instant.now());

        return dispositivoRepository.save(dispositivo);
    }

    public void desativarDispositivo(String token) {
        User user = tenantService.getUsuarioAtual();
        Long igrejaId = tenantService.getIgrejaIdAtual();
        if (token != null && !token.isBlank()) {
            dispositivoRepository.findByUserIdAndToken(user.getId(), token).ifPresent(d -> {
                d.setAtivo(false);
                d.setDesativadoEm(Instant.now());
                d.setAtualizadoEm(Instant.now());
                dispositivoRepository.save(d);
            });
        } else {
            List<UsuarioDispositivoPush> dispositivos = dispositivoRepository.findByUserIdAndIgrejaIdAndAtivoTrue(user.getId(), igrejaId);
            for (UsuarioDispositivoPush d : dispositivos) {
                d.setAtivo(false);
                d.setDesativadoEm(Instant.now());
                d.setAtualizadoEm(Instant.now());
            }
            dispositivoRepository.saveAll(dispositivos);
        }
        preferenciaRepository.findByUserIdAndIgrejaId(user.getId(), igrejaId).ifPresent(pref -> {
            pref.setPushAtivo(false);
            pref.setAtualizadoEm(Instant.now());
        });
    }

    @Transactional(readOnly = true)
    public UsuarioPreferenciaNotificacaoDTO obterPreferencias() {
        User user = tenantService.getUsuarioAtual();
        Igreja igreja = tenantService.getIgrejaAtual();
        UsuarioPreferenciaNotificacao pref = obterOuCriarPreferencias(user, igreja);
        return toDto(pref, dispositivoRepository.existsByUserIdAndIgrejaIdAndAtivoTrue(user.getId(), igreja.getId()));
    }

    public UsuarioPreferenciaNotificacaoDTO atualizarPreferencias(UsuarioPreferenciaNotificacaoDTO dto) {
        User user = tenantService.getUsuarioAtual();
        Igreja igreja = tenantService.getIgrejaAtual();
        UsuarioPreferenciaNotificacao pref = obterOuCriarPreferencias(user, igreja);

        if (dto.getPushAtivo() != null) {
            pref.setPushAtivo(dto.getPushAtivo());
            if (Boolean.FALSE.equals(dto.getPushAtivo())) {
                desativarDispositivo(null);
            }
        }
        if (dto.getEventosAtivo() != null) pref.setEventosAtivo(dto.getEventosAtivo());
        if (dto.getEscalasAtivo() != null) pref.setEscalasAtivo(dto.getEscalasAtivo());
        if (dto.getDevocionalAtivo() != null) pref.setDevocionalAtivo(dto.getDevocionalAtivo());
        if (dto.getAvisosGeraisAtivo() != null) pref.setAvisosGeraisAtivo(dto.getAvisosGeraisAtivo());
        if (dto.getDepartamentosAtivo() != null) pref.setDepartamentosAtivo(dto.getDepartamentosAtivo());
        if (dto.getHorarioSilenciosoInicio() != null) pref.setHorarioSilenciosoInicio(dto.getHorarioSilenciosoInicio());
        if (dto.getHorarioSilenciosoFim() != null) pref.setHorarioSilenciosoFim(dto.getHorarioSilenciosoFim());
        pref.setAtualizadoEm(Instant.now());
        preferenciaRepository.save(pref);
        return toDto(pref, dispositivoRepository.existsByUserIdAndIgrejaIdAndAtivoTrue(user.getId(), igreja.getId()));
    }

    /**
     * Tenta enviar push para um usuário com base em notificação interna já persistida.
     * Retorna {@code true} se pelo menos um dispositivo recebeu. Falhas não propagam.
     */
    public boolean tentarEnviarPush(NotificacaoUsuario notificacao, User user) {
        if (!pushProperties.isOperational() || notificacao == null || user == null) {
            return false;
        }
        if (Boolean.TRUE.equals(notificacao.getEnviadaPush())) {
            return false;
        }
        UsuarioPreferenciaNotificacao pref = preferenciaRepository
            .findByUserIdAndIgrejaId(user.getId(), notificacao.getIgreja().getId())
            .orElse(null);
        if (!podeEnviarPush(pref, notificacao.getTipo(), true)) {
            LOG.debug(
                "Push não enviado para usuário {} (tipo={}): preferência ou horário silencioso",
                user.getId(),
                notificacao.getTipo()
            );
            return false;
        }
        List<UsuarioDispositivoPush> dispositivos = dispositivoRepository.findByUserIdAndIgrejaIdAndAtivoTrue(
            user.getId(),
            notificacao.getIgreja().getId()
        );
        if (dispositivos.isEmpty()) {
            LOG.debug("Push não enviado para usuário {} (tipo={}): sem dispositivo registrado", user.getId(), notificacao.getTipo());
            return false;
        }
        boolean algumEnviado = false;
        String ultimoErro = null;
        for (UsuarioDispositivoPush dispositivo : dispositivos) {
            try {
                enviarFcm(dispositivo.getToken(), notificacao);
                dispositivo.setUltimoUso(Instant.now());
                dispositivo.setAtualizadoEm(Instant.now());
                algumEnviado = true;
            } catch (FirebaseMessagingException e) {
                ultimoErro = e.getMessage();
                if (tokenInvalido(e)) {
                    dispositivo.setAtivo(false);
                    dispositivo.setDesativadoEm(Instant.now());
                    dispositivo.setAtualizadoEm(Instant.now());
                    LOG.info("Token push inválido desativado para usuário {}", user.getId());
                }
                LOG.debug("Falha ao enviar push para usuário {}: {}", user.getId(), e.getMessage());
            }
        }
        dispositivoRepository.saveAll(dispositivos);
        if (algumEnviado) {
            notificacao.setEnviadaPush(true);
            notificacao.setDataEnvioPush(Instant.now());
            notificacao.setErroPush(null);
            LOG.info(
                "Push FCM enviado para usuário {} (id={}) | tipo={} | titulo=\"{}\"",
                user.getFirstName() != null ? user.getFirstName() : user.getLogin(),
                user.getId(),
                notificacao.getTipo(),
                notificacao.getTitulo()
            );
        } else if (ultimoErro != null) {
            notificacao.setErroPush(truncar(ultimoErro, 300));
        }
        notificacaoUsuarioRepository.save(notificacao);
        return algumEnviado;
    }

    public void enviarTesteParaUsuarioAtual() {
        if (!pushProperties.isTesteEndpointEnabled()) {
            throw new BadRequestAlertException("Endpoint de teste desabilitado", "push", "testedesabilitado");
        }
        User user = tenantService.getUsuarioAtual();
        Igreja igreja = tenantService.getIgrejaAtual();
        NotificacaoUsuario notificacao = new NotificacaoUsuario();
        notificacao.setIgreja(igreja);
        notificacao.setUser(user);
        notificacao.setTipo("PUSH_TESTE");
        notificacao.setTitulo("Teste de lembrete");
        notificacao.setMensagem("Se você está vendo isto, as notificações no celular estão funcionando.");
        notificacao.setLink("/configuracoes");
        notificacao.setLida(false);
        notificacao.setCriadoEm(Instant.now());
        notificacaoUsuarioRepository.save(notificacao);
        tentarEnviarPush(notificacao, user);
    }

    public boolean podeEnviarPush(UsuarioPreferenciaNotificacao pref, String tipo, boolean respeitarHorarioSilencioso) {
        if (!pushProperties.isOperational()) {
            return false;
        }
        if (pref == null || !Boolean.TRUE.equals(pref.getPushAtivo())) {
            return false;
        }
        if (respeitarHorarioSilencioso && emHorarioSilencioso(pref)) {
            return false;
        }
        return tipoPermitido(pref, tipo);
    }

    private boolean emHorarioSilencioso(UsuarioPreferenciaNotificacao pref) {
        LocalTime agora = LocalTime.now(ZONE_BR);
        LocalTime inicio = pref.getHorarioSilenciosoInicio() != null ? pref.getHorarioSilenciosoInicio() : MADRUGADA_INICIO;
        LocalTime fim = pref.getHorarioSilenciosoFim() != null ? pref.getHorarioSilenciosoFim() : MADRUGADA_FIM;
        if (inicio.isBefore(fim)) {
            return !agora.isBefore(inicio) && agora.isBefore(fim);
        }
        return !agora.isBefore(inicio) || agora.isBefore(fim);
    }

    private boolean tipoPermitido(UsuarioPreferenciaNotificacao pref, String tipo) {
        if (tipo == null) return true;
        if (tipo.startsWith("EVENTO") || "EVENTO".equals(tipo)) {
            return Boolean.TRUE.equals(pref.getEventosAtivo());
        }
        if (tipo.startsWith("ESCALA") || "ESCALA".equals(tipo)) {
            return Boolean.TRUE.equals(pref.getEscalasAtivo());
        }
        if (tipo.startsWith("DEVOCIONAL")) {
            return Boolean.TRUE.equals(pref.getDevocionalAtivo());
        }
        if (tipo.startsWith("VERSICULO")) {
            return Boolean.TRUE.equals(pref.getDevocionalAtivo()) || Boolean.TRUE.equals(pref.getAvisosGeraisAtivo());
        }
        if (tipo.startsWith("COMUNICADO") || tipo.startsWith("AVISO")) {
            return Boolean.TRUE.equals(pref.getAvisosGeraisAtivo());
        }
        if (tipo.startsWith("DEPARTAMENTO")) {
            return Boolean.TRUE.equals(pref.getDepartamentosAtivo());
        }
        if ("PUSH_TESTE".equals(tipo)) {
            return true;
        }
        return Boolean.TRUE.equals(pref.getAvisosGeraisAtivo());
    }

    private void enviarFcm(String token, NotificacaoUsuario notificacao) throws FirebaseMessagingException {
        if (FirebaseApp.getApps().isEmpty()) {
            throw new IllegalStateException("Firebase não inicializado");
        }
        Map<String, String> data = new HashMap<>();
        data.put("title", notificacao.getTitulo());
        data.put("body", notificacao.getMensagem() != null ? notificacao.getMensagem() : "");
        data.put("url", notificacao.getLink() != null ? notificacao.getLink() : "/");
        data.put("notificationId", notificacao.getId() != null ? notificacao.getId().toString() : "");
        data.put("tipo", notificacao.getTipo());

        Message message = Message.builder()
            .setToken(token)
            .setNotification(
                Notification.builder()
                    .setTitle(notificacao.getTitulo())
                    .setBody(notificacao.getMensagem())
                    .build()
            )
            .putAllData(data)
            .build();
        FirebaseMessaging.getInstance().send(message);
    }

    private boolean tokenInvalido(FirebaseMessagingException e) {
        MessagingErrorCode code = e.getMessagingErrorCode();
        return code == MessagingErrorCode.UNREGISTERED || code == MessagingErrorCode.INVALID_ARGUMENT;
    }

    private UsuarioPreferenciaNotificacao obterOuCriarPreferencias(User user, Igreja igreja) {
        return preferenciaRepository.findByUserIdAndIgrejaId(user.getId(), igreja.getId()).orElseGet(() -> {
            UsuarioPreferenciaNotificacao pref = new UsuarioPreferenciaNotificacao();
            pref.setUser(user);
            pref.setIgreja(igreja);
            pref.setPushAtivo(false);
            pref.setEventosAtivo(true);
            pref.setEscalasAtivo(true);
            pref.setDevocionalAtivo(false);
            pref.setAvisosGeraisAtivo(true);
            pref.setDepartamentosAtivo(true);
            pref.setCriadoEm(Instant.now());
            pref.setAtualizadoEm(Instant.now());
            return preferenciaRepository.save(pref);
        });
    }

    private PlataformaPush resolverPlataforma(String valor) {
        if (valor == null || valor.isBlank()) {
            return PlataformaPush.DESCONHECIDO;
        }
        try {
            return PlataformaPush.valueOf(valor.toUpperCase());
        } catch (IllegalArgumentException e) {
            return PlataformaPush.DESCONHECIDO;
        }
    }

    private UsuarioPreferenciaNotificacaoDTO toDto(UsuarioPreferenciaNotificacao pref, boolean dispositivoRegistrado) {
        UsuarioPreferenciaNotificacaoDTO dto = new UsuarioPreferenciaNotificacaoDTO();
        dto.setPushAtivo(pref.getPushAtivo());
        dto.setEventosAtivo(pref.getEventosAtivo());
        dto.setEscalasAtivo(pref.getEscalasAtivo());
        dto.setDevocionalAtivo(pref.getDevocionalAtivo());
        dto.setAvisosGeraisAtivo(pref.getAvisosGeraisAtivo());
        dto.setDepartamentosAtivo(pref.getDepartamentosAtivo());
        dto.setHorarioSilenciosoInicio(pref.getHorarioSilenciosoInicio());
        dto.setHorarioSilenciosoFim(pref.getHorarioSilenciosoFim());
        dto.setDispositivoRegistrado(dispositivoRegistrado);
        return dto;
    }

    private String truncar(String valor, int max) {
        if (valor == null) return null;
        return valor.length() <= max ? valor : valor.substring(0, max);
    }
}
