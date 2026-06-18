package br.com.semear.service;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Service
public class SmsService {

    private static final Logger LOG = LoggerFactory.getLogger(SmsService.class);
    private static final String BREVO_SMS_URL = "https://api.brevo.com/v3/transactionalSMS/send";

    private final RestClient brevoClient;

    @Value("${semear.sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${semear.brevo.api-key:}")
    private String brevoApiKey;

    @Value("${semear.sms.sender:Semear}")
    private String smsSender;

    public SmsService() {
        this.brevoClient = RestClient.create();
    }

    public boolean isDisponivel() {
        return smsEnabled && brevoApiKey != null && !brevoApiKey.isBlank();
    }

    public void enviarCodigoRecuperacao(String telefone, String codigo) {
        if (!isDisponivel()) {
            LOG.warn("SMS não configurado. Código de recuperação não enviado por SMS para {}", mascararTelefone(telefone));
            throw new IllegalStateException("SMS não configurado");
        }

        String destino = normalizarTelefoneBrasil(telefone);
        String conteudo =
            br.com.semear.config.Constants.NOME_PLATAFORMA +
            ": codigo de recuperacao " +
            codigo +
            ". Valido por 15 minutos.";

        try {
            brevoClient
                .post()
                .uri(BREVO_SMS_URL)
                .header("api-key", brevoApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(
                    Map.of(
                        "type",
                        "transactional",
                        "unicodeEnabled",
                        false,
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
        } catch (RestClientResponseException e) {
            LOG.warn(
                "Brevo rejeitou SMS de recuperação para {} — HTTP {}: {}",
                mascararTelefone(destino),
                e.getStatusCode().value(),
                e.getResponseBodyAsString()
            );
            throw new IllegalStateException(mensagemErroBrevo(e), e);
        } catch (Exception e) {
            LOG.warn("Falha ao enviar SMS de recuperação para {}", mascararTelefone(destino), e);
            throw new IllegalStateException("Falha ao enviar SMS. Tente receber o código por e-mail.", e);
        }
    }

    private String mensagemErroBrevo(RestClientResponseException e) {
        int status = e.getStatusCode().value();
        if (status == 402) {
            return "SMS indisponível: verifique créditos ou Sender ID no Brevo. Tente receber o código por e-mail.";
        }
        if (status == 400) {
            return "Não foi possível enviar SMS para este número. Verifique o celular cadastrado ou use e-mail.";
        }
        return "Falha ao enviar SMS. Tente receber o código por e-mail.";
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
