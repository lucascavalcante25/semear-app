package br.com.semear.service.exception;

/** Falha ao enviar e-mail (configuração ausente ou erro do provedor). */
public class EmailEnvioException extends RuntimeException {

    public EmailEnvioException(String message) {
        super(message);
    }

    public EmailEnvioException(String message, Throwable cause) {
        super(message, cause);
    }
}
