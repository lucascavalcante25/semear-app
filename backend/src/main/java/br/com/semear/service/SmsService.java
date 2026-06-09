package br.com.semear.service;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class SmsService {

    private static final Logger LOG = LoggerFactory.getLogger(SmsService.class);

    @Value("${semear.sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${semear.brevo.api-key:}")
    private String brevoApiKey;

    @Value("${semear.sms.sender:Semear}")
    private String smsSender;

    public boolean isDisponivel() {
        return smsEnabled && brevoApiKey != null && !brevoApiKey.isBlank();
    }

    public void enviarCodigoRecuperacao(String telefone, String codigo) {
        if (!isDisponivel()) {
            LOG.warn("SMS não configurado. Código de recuperação não enviado por SMS para {}", mascararTelefone(telefone));
            throw new IllegalStateException("SMS não configurado");
        }

        String destino = normalizarTelefoneBrasil(telefone);
        String conteudo = "Semear: seu código de recuperação de senha é " + codigo + ". Válido por 15 minutos.";

        try {
            RestClient.create()
                .post()
                .uri("https://api.brevo.com/v3/transactionalSMS/sms")
                .header("api-key", brevoApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(
                    Map.of(
                        "type",
                        "transactional",
                        "unicodeEnabled",
                        true,
                        "sender",
                        smsSender,
                        "recipient",
                        destino,
                        "content",
                        conteudo
                    )
                )
                .retrieve()
                .toBodilessEntity();
            LOG.debug("SMS de recuperação enviado para {}", mascararTelefone(destino));
        } catch (Exception e) {
            LOG.warn("Falha ao enviar SMS de recuperação para {}", mascararTelefone(destino), e);
            throw new IllegalStateException("Falha ao enviar SMS");
        }
    }

    private String normalizarTelefoneBrasil(String telefone) {
        String digits = telefone.replaceAll("\\D", "");
        if (digits.startsWith("55")) {
            return digits;
        }
        if (digits.length() == 11 || digits.length() == 10) {
            return "55" + digits;
        }
        return digits;
    }

    private String mascararTelefone(String telefone) {
        String digits = telefone.replaceAll("\\D", "");
        if (digits.length() < 4) {
            return "****";
        }
        return "*****" + digits.substring(digits.length() - 4);
    }
}
