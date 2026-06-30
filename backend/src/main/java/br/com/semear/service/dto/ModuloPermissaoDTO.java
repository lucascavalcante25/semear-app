package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.NivelAcessoModulo;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class ModuloPermissaoDTO implements Serializable {

    private String modulo;
    private NivelAcessoModulo nivel;

    public ModuloPermissaoDTO() {}

    public ModuloPermissaoDTO(String modulo, NivelAcessoModulo nivel) {
        this.modulo = modulo;
        this.nivel = nivel;
    }

    public String getModulo() {
        return modulo;
    }

    public void setModulo(String modulo) {
        this.modulo = modulo;
    }

    public NivelAcessoModulo getNivel() {
        return nivel;
    }

    public void setNivel(NivelAcessoModulo nivel) {
        this.nivel = nivel;
    }
}
