package br.com.semear.service;

import br.com.semear.domain.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.http.MediaType;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import tech.jhipster.config.JHipsterProperties;

/**
 * Service for sending emails asynchronously.
 */
@Service
public class MailService {

    private static final Logger LOG = LoggerFactory.getLogger(MailService.class);
    private static final String USER = "user";
    private static final String BASE_URL = "baseUrl";
    private static final String PLATAFORMA_NOME = "WillSas";

    private final JHipsterProperties jHipsterProperties;
    private final JavaMailSender javaMailSender;
    private final MessageSource messageSource;
    private final SpringTemplateEngine templateEngine;

    @Value("${semear.brevo.api-key:}")
    private String brevoApiKey;

    public MailService(
        JHipsterProperties jHipsterProperties,
        JavaMailSender javaMailSender,
        MessageSource messageSource,
        SpringTemplateEngine templateEngine
    ) {
        this.jHipsterProperties = jHipsterProperties;
        this.javaMailSender = javaMailSender;
        this.messageSource = messageSource;
        this.templateEngine = templateEngine;
    }

    private boolean brevoDisponivel() {
        return brevoApiKey != null && !brevoApiKey.isBlank();
    }

    @Async
    public void sendEmail(String to, String subject, String content, boolean isMultipart, boolean isHtml) {
        sendEmailSync(to, subject, content, isMultipart, isHtml);
    }

    private void sendEmailSync(String to, String subject, String content, boolean isMultipart, boolean isHtml) {
        LOG.debug(
            "Send email[multipart '{}' and html '{}'] to '{}' with subject '{}'",
            isMultipart,
            isHtml,
            to,
            subject
        );

        if (brevoDisponivel()) {
            try {
                enviarViaBrevoApi(to, subject, content);
                LOG.debug("Sent email via Brevo API to '{}'", to);
                return;
            } catch (Exception e) {
                LOG.warn("Brevo API failed for '{}', trying SMTP fallback", to, e);
            }
        }

        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper message = new MimeMessageHelper(mimeMessage, isMultipart, StandardCharsets.UTF_8.name());
            message.setTo(to);
            message.setFrom(jHipsterProperties.getMail().getFrom());
            message.setSubject(subject);
            message.setText(content, isHtml);
            javaMailSender.send(mimeMessage);
            LOG.debug("Sent email via SMTP to '{}'", to);
        } catch (MailException | MessagingException e) {
            LOG.warn("Email could not be sent to user '{}'", to, e);
        }
    }

    private void enviarViaBrevoApi(String to, String subject, String htmlContent) {
        String from = jHipsterProperties.getMail().getFrom();
        Map<String, Object> body = Map.of(
            "sender",
            Map.of("email", from, "name", PLATAFORMA_NOME),
            "to",
            List.of(Map.of("email", to)),
            "subject",
            subject,
            "htmlContent",
            htmlContent
        );
        RestClient.create()
            .post()
            .uri("https://api.brevo.com/v3/smtp/email")
            .header("api-key", brevoApiKey)
            .contentType(MediaType.APPLICATION_JSON)
            .body(body)
            .retrieve()
            .toBodilessEntity();
    }

    @Async
    public void sendEmailFromTemplate(User user, String templateName, String titleKey) {
        sendEmailFromTemplateSync(user, templateName, titleKey);
    }

    private void sendEmailFromTemplateSync(User user, String templateName, String titleKey) {
        if (user.getEmail() == null) {
            LOG.debug("Email doesn't exist for user '{}'", user.getLogin());
            return;
        }
        Locale locale = Locale.forLanguageTag(user.getLangKey());
        Context context = new Context(locale);
        context.setVariable(USER, user);
        context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
        String content = templateEngine.process(templateName, context);
        String subject = messageSource.getMessage(titleKey, null, locale);
        sendEmailSync(user.getEmail(), subject, content, false, true);
    }

    @Async
    public void sendActivationEmail(User user) {
        LOG.debug("Sending activation email to '{}'", user.getEmail());
        sendEmailFromTemplateSync(user, "mail/activationEmail", "email.activation.title");
    }

    @Async
    public void sendCreationEmail(User user) {
        LOG.debug("Sending creation email to '{}'", user.getEmail());
        sendEmailFromTemplateSync(user, "mail/creationEmail", "email.activation.title");
    }

    @Async
    public void sendPasswordResetMail(User user) {
        LOG.debug("Sending password reset email to '{}'", user.getEmail());
        sendEmailFromTemplateSync(user, "mail/passwordResetEmail", "email.reset.title");
    }

    @Async
    public void sendCodigoRecuperacaoEmail(String to, String codigo) {
        String subject = "Código de recuperação de senha — " + PLATAFORMA_NOME;
        String content =
            "<p>Olá,</p>" +
            "<p>Recebemos uma solicitação para redefinir sua senha na plataforma <strong>" +
            PLATAFORMA_NOME +
            "</strong>.</p>" +
            "<p>Seu código de verificação é:</p>" +
            "<p style=\"font-size:24px;font-weight:bold;letter-spacing:4px\">" +
            codigo +
            "</p>" +
            "<p>Este código é válido por <strong>15 minutos</strong>.</p>" +
            "<p>Se você não solicitou esta alteração, ignore este e-mail.</p>" +
            "<p>— Equipe " +
            PLATAFORMA_NOME +
            "</p>";
        sendEmailSync(to, subject, content, false, true);
    }

    @Async
    public void sendSolicitacaoRecebidaEmail(String to, String nomeSolicitante, String nomeIgreja) {
        String baseUrl = jHipsterProperties.getMail().getBaseUrl();
        String subject = "Solicitação recebida — " + PLATAFORMA_NOME;
        String content =
            "<p>Olá, <strong>" +
            nomeSolicitante +
            "</strong>,</p>" +
            "<p>Recebemos sua solicitação de cadastro da igreja <strong>" +
            nomeIgreja +
            "</strong> na plataforma <strong>" +
            PLATAFORMA_NOME +
            "</strong>.</p>" +
            "<p>Nossa equipe irá analisar os dados informados. Você receberá um novo e-mail assim que a solicitação for aprovada ou rejeitada.</p>" +
            "<p>Após a aprovação, seu acesso será liberado com o <strong>CPF</strong> e a <strong>senha</strong> que você definiu no formulário.</p>" +
            (baseUrl != null && !baseUrl.isBlank()
                ? "<p><a href=\"" + baseUrl + "/login\">Acessar a plataforma</a></p>"
                : "") +
            "<p>— Equipe " +
            PLATAFORMA_NOME +
            "</p>";
        sendEmailSync(to, subject, content, false, true);
    }

    @Async
    public void sendAcessoPlataformaAprovadoEmail(String to, String nomeIgreja, String cpfLogin) {
        String baseUrl = jHipsterProperties.getMail().getBaseUrl();
        String subject = "Cadastro aprovado — " + PLATAFORMA_NOME;
        String content =
            "<p>Olá,</p>" +
            "<p>Sua solicitação foi <strong>aprovada</strong>! A igreja <strong>" +
            nomeIgreja +
            "</strong> foi cadastrada na plataforma <strong>" +
            PLATAFORMA_NOME +
            "</strong>.</p>" +
            "<p>Você foi definido como <strong>administrador</strong> da igreja e já pode aprovar pré-cadastros de membros.</p>" +
            "<p><strong>Login:</strong> seu CPF (somente números)</p>" +
            "<p><strong>Senha:</strong> a mesma que você definiu ao solicitar o cadastro.</p>" +
            "<p>Configure os dados da igreja (PIX, identidade visual, plano de leitura) em <em>Configurações da Igreja</em> após o primeiro acesso.</p>" +
            (baseUrl != null && !baseUrl.isBlank()
                ? "<p><a href=\"" + baseUrl + "/login\">Entrar na plataforma</a></p>"
                : "") +
            "<p>— Equipe " +
            PLATAFORMA_NOME +
            "</p>";
        sendEmailSync(to, subject, content, false, true);
    }

    @Async
    public void sendSolicitacaoRejeitadaEmail(String to, String nomeIgreja, String observacao) {
        String subject = "Solicitação não aprovada — " + PLATAFORMA_NOME;
        String obs =
            observacao != null && !observacao.isBlank()
                ? "<p><strong>Observação:</strong> " + observacao + "</p>"
                : "";
        String content =
            "<p>Olá,</p>" +
            "<p>Informamos que a solicitação de cadastro da igreja <strong>" +
            nomeIgreja +
            "</strong> não foi aprovada neste momento.</p>" +
            obs +
            "<p>Em caso de dúvidas, entre em contato com nossa equipe.</p>" +
            "<p>— Equipe " +
            PLATAFORMA_NOME +
            "</p>";
        sendEmailSync(to, subject, content, false, true);
    }

    @Async
    public void sendAcessoPlataformaEmail(String to, String nomeIgreja, String senhaTemp) {
        String subject = "Acesso à plataforma " + PLATAFORMA_NOME + " — " + nomeIgreja;
        String content =
            "<p>Olá,</p>" +
            "<p>Sua solicitação foi <strong>aprovada</strong>. A igreja <strong>" +
            nomeIgreja +
            "</strong> foi cadastrada na plataforma " +
            PLATAFORMA_NOME +
            ".</p>" +
            "<p><strong>Login:</strong> " +
            to +
            "</p>" +
            "<p><strong>Senha temporária:</strong> " +
            senhaTemp +
            "</p>" +
            "<p>Altere sua senha no primeiro acesso.</p>" +
            "<p>— Equipe " +
            PLATAFORMA_NOME +
            "</p>";
        sendEmailSync(to, subject, content, false, true);
    }
}
