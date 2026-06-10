package br.com.semear.service.dto;

import java.io.Serializable;

public class ProrrogarTesteDTO implements Serializable {

    private Integer dias;

    public Integer getDias() {
        return dias;
    }

    public void setDias(Integer dias) {
        this.dias = dias;
    }
}
