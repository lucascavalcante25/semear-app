package br.com.semear.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FirebaseConfiguration {

    private static final Logger LOG = LoggerFactory.getLogger(FirebaseConfiguration.class);

    private final PushNotificationProperties pushProperties;

    public FirebaseConfiguration(PushNotificationProperties pushProperties) {
        this.pushProperties = pushProperties;
    }

    @PostConstruct
    public void initFirebase() {
        if (!pushProperties.isOperational()) {
            LOG.info("Push notifications desabilitado ou Firebase não configurado — FCM não inicializado");
            return;
        }
        if (!FirebaseApp.getApps().isEmpty()) {
            return;
        }
        try (InputStream credentials = abrirCredenciais(pushProperties.getFirebaseServiceAccount())) {
            FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(credentials))
                .setProjectId(pushProperties.getFirebaseProjectId())
                .build();
            FirebaseApp.initializeApp(options);
            LOG.info("Firebase Admin SDK inicializado para push (projeto: {})", pushProperties.getFirebaseProjectId());
        } catch (IOException e) {
            LOG.error("Falha ao inicializar Firebase Admin SDK — push ficará indisponível", e);
        }
    }

    private InputStream abrirCredenciais(String valor) throws IOException {
        if (valor == null || valor.isBlank()) {
            throw new IOException("Service account não configurada");
        }
        String trimmed = valor.trim();
        if (trimmed.startsWith("{")) {
            return new ByteArrayInputStream(trimmed.getBytes(StandardCharsets.UTF_8));
        }
        Path path = Path.of(trimmed);
        if (Files.exists(path)) {
            return new FileInputStream(path.toFile());
        }
        return new ByteArrayInputStream(trimmed.getBytes(StandardCharsets.UTF_8));
    }
}
