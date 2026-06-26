package br.com.semear.service.dto;

import java.io.Serializable;

public class PushConfigPublicaDTO implements Serializable {

    private boolean disponivel;
    private String vapidPublicKey;
    private String firebaseProjectId;

    public boolean isDisponivel() { return disponivel; }
    public void setDisponivel(boolean disponivel) { this.disponivel = disponivel; }
    public String getVapidPublicKey() { return vapidPublicKey; }
    public void setVapidPublicKey(String vapidPublicKey) { this.vapidPublicKey = vapidPublicKey; }
    public String getFirebaseProjectId() { return firebaseProjectId; }
    public void setFirebaseProjectId(String firebaseProjectId) { this.firebaseProjectId = firebaseProjectId; }
}
