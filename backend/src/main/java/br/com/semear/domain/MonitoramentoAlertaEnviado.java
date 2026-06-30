package br.com.semear.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "monitoramento_alerta_enviado")
public class MonitoramentoAlertaEnviado implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "tipo_alerta", length = 50)
    private String tipoAlerta;

    @Column(name = "ultimo_envio_em", nullable = false)
    private Instant ultimoEnvioEm;

    public String getTipoAlerta() { return tipoAlerta; }
    public void setTipoAlerta(String tipoAlerta) { this.tipoAlerta = tipoAlerta; }
    public Instant getUltimoEnvioEm() { return ultimoEnvioEm; }
    public void setUltimoEnvioEm(Instant ultimoEnvioEm) { this.ultimoEnvioEm = ultimoEnvioEm; }
}
