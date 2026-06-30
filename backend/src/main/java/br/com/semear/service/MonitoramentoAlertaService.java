package br.com.semear.service;

import br.com.semear.domain.MonitoramentoAlertaEnviado;
import br.com.semear.domain.User;
import br.com.semear.repository.MonitoramentoAlertaEnviadoRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.dto.AdminMonitoramentoDTO;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Status;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MonitoramentoAlertaService {

    private static final Logger LOG = LoggerFactory.getLogger(MonitoramentoAlertaService.class);

    public static final String ALERTA_MEMORIA = "MEMORIA_ALTA";
    public static final String ALERTA_POOL = "POOL_CONEXOES";
    public static final String ALERTA_BANCO = "BANCO_INDISPONIVEL";
    public static final String ALERTA_REQUISICOES = "REQUISICOES_ALTAS";

    private final MailService mailService;
    private final UserRepository userRepository;
    private final MonitoramentoAlertaEnviadoRepository alertaRepository;

    @Value("${semear.monitoramento.alertas.habilitado:true}")
    private boolean alertasHabilitados;

    @Value("${semear.monitoramento.alertas.cooldown-minutos:60}")
    private int cooldownMinutos;

    @Value("${semear.monitoramento.alertas.email-destinos:}")
    private String emailsDestinoConfig;

    public MonitoramentoAlertaService(
        MailService mailService,
        UserRepository userRepository,
        MonitoramentoAlertaEnviadoRepository alertaRepository
    ) {
        this.mailService = mailService;
        this.userRepository = userRepository;
        this.alertaRepository = alertaRepository;
    }

    public void verificarEAlertar(AdminMonitoramentoDTO dados) {
        if (!alertasHabilitados || !mailService.isEnvioDisponivel()) {
            return;
        }

        List<String> problemas = new ArrayList<>();
        if (dados.getMemoriaPercentual() >= 85) {
            problemas.add("Memória JVM em " + dados.getMemoriaPercentual() + "%");
            dispararSeNecessario(ALERTA_MEMORIA, "Memória JVM alta", problemas.get(problemas.size() - 1), dados);
        }
        if (dados.getConexoesMax() > 0 && dados.getConexoesAtivas() >= dados.getConexoesMax() * 0.9) {
            String msg = "Pool de conexões: " + dados.getConexoesAtivas() + "/" + dados.getConexoesMax();
            problemas.add(msg);
            dispararSeNecessario(ALERTA_POOL, "Pool de conexões quase esgotado", msg, dados);
        }
        if (!Status.UP.getCode().equals(dados.getStatusBanco())) {
            String msg = "Banco com status " + dados.getStatusBanco();
            problemas.add(msg);
            dispararSeNecessario(ALERTA_BANCO, "Banco de dados indisponível", msg, dados);
        }
        if (dados.getRequisicoesPorMinuto() > 120) {
            String msg = "Volume de " + dados.getRequisicoesPorMinuto() + " req/min";
            problemas.add(msg);
            dispararSeNecessario(ALERTA_REQUISICOES, "Alto volume de requisições", msg, dados);
        }
    }

    private void dispararSeNecessario(String tipo, String titulo, String detalhe, AdminMonitoramentoDTO dados) {
        if (!podeEnviar(tipo)) {
            return;
        }
        Set<String> destinos = resolverDestinos();
        if (destinos.isEmpty()) {
            LOG.warn("Alerta de monitoramento '{}' sem destinatários de e-mail configurados", tipo);
            return;
        }

        String assunto = "[Semear] Alerta: " + titulo;
        String corpo =
            "<p><strong>" +
            titulo +
            "</strong></p>" +
            "<p>" +
            detalhe +
            "</p>" +
            "<ul>" +
            "<li>Status geral: " +
            dados.getStatusGeral() +
            "</li>" +
            "<li>Memória: " +
            dados.getMemoriaPercentual() +
            "%</li>" +
            "<li>CPU: " +
            dados.getCpuPercentual() +
            "%</li>" +
            "<li>Conexões: " +
            dados.getConexoesAtivas() +
            "/" +
            dados.getConexoesMax() +
            "</li>" +
            "<li>Req/min: " +
            dados.getRequisicoesPorMinuto() +
            "</li>" +
            "</ul>" +
            "<p>Acesse o painel <em>Monitoramento</em> no super-admin para mais detalhes.</p>";

        for (String email : destinos) {
            try {
                mailService.sendEmail(email, assunto, corpo, false, true);
            } catch (Exception e) {
                LOG.warn("Falha ao enviar alerta de monitoramento para {}", email, e);
            }
        }

        MonitoramentoAlertaEnviado registro = alertaRepository.findById(tipo).orElseGet(MonitoramentoAlertaEnviado::new);
        registro.setTipoAlerta(tipo);
        registro.setUltimoEnvioEm(Instant.now());
        alertaRepository.save(registro);
        LOG.info("Alerta de monitoramento '{}' enviado para {} destinatário(s)", tipo, destinos.size());
    }

    private boolean podeEnviar(String tipo) {
        return alertaRepository
            .findById(tipo)
            .map(r -> r.getUltimoEnvioEm().isBefore(Instant.now().minus(cooldownMinutos, ChronoUnit.MINUTES)))
            .orElse(true);
    }

    private Set<String> resolverDestinos() {
        Set<String> destinos = new LinkedHashSet<>();
        if (StringUtils.isNotBlank(emailsDestinoConfig)) {
            for (String email : emailsDestinoConfig.split("[,;]")) {
                String limpo = email.trim();
                if (!limpo.isBlank()) {
                    destinos.add(limpo);
                }
            }
        }
        if (destinos.isEmpty()) {
            for (User user : userRepository.findAllAtivosComAutoridade(AuthoritiesConstants.SUPER_ADMIN)) {
                if (StringUtils.isNotBlank(user.getEmail())) {
                    destinos.add(user.getEmail().trim());
                }
            }
        }
        return destinos;
    }
}
