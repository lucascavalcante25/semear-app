package br.com.semear.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "semear.push", ignoreUnknownFields = false)
public class PushNotificationProperties {

    private boolean enabled = false;
    private String firebaseProjectId;
    /** JSON da service account (conteúdo completo) ou caminho do arquivo. */
    private String firebaseServiceAccount;
    /** VAPID key pública para o frontend Web (Firebase Console > Cloud Messaging > Web Push certificates). */
    private String vapidPublicKey;
    private boolean testeEndpointEnabled = false;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getFirebaseProjectId() {
        return firebaseProjectId;
    }

    public void setFirebaseProjectId(String firebaseProjectId) {
        this.firebaseProjectId = firebaseProjectId;
    }

    public String getFirebaseServiceAccount() {
        return firebaseServiceAccount;
    }

    public void setFirebaseServiceAccount(String firebaseServiceAccount) {
        this.firebaseServiceAccount = firebaseServiceAccount;
    }

    public String getVapidPublicKey() {
        return vapidPublicKey;
    }

    public void setVapidPublicKey(String vapidPublicKey) {
        if (vapidPublicKey == null) {
            this.vapidPublicKey = null;
            return;
        }
        // Render/env às vezes incluem aspas ou espaços — quebram o getToken no iOS
        this.vapidPublicKey = vapidPublicKey.trim().replace("\"", "").replace("'", "");
    }

    public boolean isTesteEndpointEnabled() {
        return testeEndpointEnabled;
    }

    public void setTesteEndpointEnabled(boolean testeEndpointEnabled) {
        this.testeEndpointEnabled = testeEndpointEnabled;
    }

    public boolean isOperational() {
        return enabled && firebaseProjectId != null && !firebaseProjectId.isBlank()
            && firebaseServiceAccount != null && !firebaseServiceAccount.isBlank();
    }
}
