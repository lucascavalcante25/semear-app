package br.com.semear.web.rest.vm;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public class AprovarPreCadastroVM {

    @NotNull
    private String perfilAprovado;

    private List<String> modules;

    public String getPerfilAprovado() {
        return perfilAprovado;
    }

    public void setPerfilAprovado(String perfilAprovado) {
        this.perfilAprovado = perfilAprovado;
    }

    public List<String> getModules() {
        return modules;
    }

    public void setModules(List<String> modules) {
        this.modules = modules;
    }
}

