package br.com.semear.service.dto;

import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;

public class CultoCancelarDTO implements Serializable {

    @NotNull
    private Long cultoRegistroId;

    @NotNull
    private LocalDate data;

    private String motivoCancelamento;

    public Long getCultoRegistroId() {
        return cultoRegistroId;
    }

    public void setCultoRegistroId(Long cultoRegistroId) {
        this.cultoRegistroId = cultoRegistroId;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public String getMotivoCancelamento() {
        return motivoCancelamento;
    }

    public void setMotivoCancelamento(String motivoCancelamento) {
        this.motivoCancelamento = motivoCancelamento;
    }
}
