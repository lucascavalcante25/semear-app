package br.com.semear.service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.time.LocalDate;

/**
 * DTO para criação de dependente (criança/jovem sem login).
 */
public class DependenteCreateDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 100)
    private String nome;

    @NotNull(message = "Data de nascimento é obrigatória")
    private LocalDate birthDate;

    private Long paiId;
    private Long maeId;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public Long getPaiId() {
        return paiId;
    }

    public void setPaiId(Long paiId) {
        this.paiId = paiId;
    }

    public Long getMaeId() {
        return maeId;
    }

    public void setMaeId(Long maeId) {
        this.maeId = maeId;
    }
}
