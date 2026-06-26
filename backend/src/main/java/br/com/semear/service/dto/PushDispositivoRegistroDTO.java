package br.com.semear.service.dto;

import java.io.Serializable;

public class PushDispositivoRegistroDTO implements Serializable {

    private String token;
    private String plataforma;
    private String navegador;
    private String userAgent;

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getPlataforma() { return plataforma; }
    public void setPlataforma(String plataforma) { this.plataforma = plataforma; }
    public String getNavegador() { return navegador; }
    public void setNavegador(String navegador) { this.navegador = navegador; }
    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
}
