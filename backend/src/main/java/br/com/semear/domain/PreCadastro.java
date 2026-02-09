package br.com.semear.domain;

import br.com.semear.domain.enumeration.PerfilAcesso;
import br.com.semear.domain.enumeration.Sexo;
import br.com.semear.domain.enumeration.StatusCadastro;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A PreCadastro.
 */
@Entity
@Table(name = "pre_cadastro")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PreCadastro implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "nome_completo", nullable = false)
    private String nomeCompleto;

    @NotNull
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @NotNull
    @Column(name = "telefone", nullable = false)
    private String telefone;

    @NotNull
    @Column(name = "telefone_secundario", nullable = false)
    private String telefoneSecundario;

    @NotNull
    @Column(name = "telefone_emergencia", nullable = false)
    private String telefoneEmergencia;

    @NotNull
    @Column(name = "nome_contato_emergencia", nullable = false)
    private String nomeContatoEmergencia;

    @NotNull
    @Column(name = "cpf", nullable = false, unique = true)
    private String cpf;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "sexo", nullable = false)
    private Sexo sexo;

    @NotNull
    @Column(name = "data_nascimento", nullable = false)
    private LocalDate dataNascimento;

    @NotNull
    @Column(name = "login", nullable = false, unique = true)
    private String login;

    @NotNull
    @Size(min = 8)
    @Column(name = "senha", nullable = false)
    private String senha;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "perfil_solicitado", nullable = false)
    private PerfilAcesso perfilSolicitado;

    @Enumerated(EnumType.STRING)
    @Column(name = "perfil_aprovado")
    private PerfilAcesso perfilAprovado;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private StatusCadastro status;

    @Lob
    @Column(name = "observacoes")
    private String observacoes;

    @NotNull
    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm;

    @Column(name = "atualizado_em")
    private Instant atualizadoEm;

    @JsonIgnoreProperties(value = { "preCadastro" }, allowSetters = true)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(unique = true)
    private Endereco endereco;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public PreCadastro id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomeCompleto() {
        return this.nomeCompleto;
    }

    public PreCadastro nomeCompleto(String nomeCompleto) {
        this.setNomeCompleto(nomeCompleto);
        return this;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public String getEmail() {
        return this.email;
    }

    public PreCadastro email(String email) {
        this.setEmail(email);
        return this;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefone() {
        return this.telefone;
    }

    public PreCadastro telefone(String telefone) {
        this.setTelefone(telefone);
        return this;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getTelefoneSecundario() {
        return this.telefoneSecundario;
    }

    public PreCadastro telefoneSecundario(String telefoneSecundario) {
        this.setTelefoneSecundario(telefoneSecundario);
        return this;
    }

    public void setTelefoneSecundario(String telefoneSecundario) {
        this.telefoneSecundario = telefoneSecundario;
    }

    public String getTelefoneEmergencia() {
        return this.telefoneEmergencia;
    }

    public PreCadastro telefoneEmergencia(String telefoneEmergencia) {
        this.setTelefoneEmergencia(telefoneEmergencia);
        return this;
    }

    public void setTelefoneEmergencia(String telefoneEmergencia) {
        this.telefoneEmergencia = telefoneEmergencia;
    }

    public String getNomeContatoEmergencia() {
        return this.nomeContatoEmergencia;
    }

    public PreCadastro nomeContatoEmergencia(String nomeContatoEmergencia) {
        this.setNomeContatoEmergencia(nomeContatoEmergencia);
        return this;
    }

    public void setNomeContatoEmergencia(String nomeContatoEmergencia) {
        this.nomeContatoEmergencia = nomeContatoEmergencia;
    }

    public String getCpf() {
        return this.cpf;
    }

    public PreCadastro cpf(String cpf) {
        this.setCpf(cpf);
        return this;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public Sexo getSexo() {
        return this.sexo;
    }

    public PreCadastro sexo(Sexo sexo) {
        this.setSexo(sexo);
        return this;
    }

    public void setSexo(Sexo sexo) {
        this.sexo = sexo;
    }

    public LocalDate getDataNascimento() {
        return this.dataNascimento;
    }

    public PreCadastro dataNascimento(LocalDate dataNascimento) {
        this.setDataNascimento(dataNascimento);
        return this;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getLogin() {
        return this.login;
    }

    public PreCadastro login(String login) {
        this.setLogin(login);
        return this;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getSenha() {
        return this.senha;
    }

    public PreCadastro senha(String senha) {
        this.setSenha(senha);
        return this;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public PerfilAcesso getPerfilSolicitado() {
        return this.perfilSolicitado;
    }

    public PreCadastro perfilSolicitado(PerfilAcesso perfilSolicitado) {
        this.setPerfilSolicitado(perfilSolicitado);
        return this;
    }

    public void setPerfilSolicitado(PerfilAcesso perfilSolicitado) {
        this.perfilSolicitado = perfilSolicitado;
    }

    public PerfilAcesso getPerfilAprovado() {
        return this.perfilAprovado;
    }

    public PreCadastro perfilAprovado(PerfilAcesso perfilAprovado) {
        this.setPerfilAprovado(perfilAprovado);
        return this;
    }

    public void setPerfilAprovado(PerfilAcesso perfilAprovado) {
        this.perfilAprovado = perfilAprovado;
    }

    public StatusCadastro getStatus() {
        return this.status;
    }

    public PreCadastro status(StatusCadastro status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(StatusCadastro status) {
        this.status = status;
    }

    public String getObservacoes() {
        return this.observacoes;
    }

    public PreCadastro observacoes(String observacoes) {
        this.setObservacoes(observacoes);
        return this;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public Instant getCriadoEm() {
        return this.criadoEm;
    }

    public PreCadastro criadoEm(Instant criadoEm) {
        this.setCriadoEm(criadoEm);
        return this;
    }

    public void setCriadoEm(Instant criadoEm) {
        this.criadoEm = criadoEm;
    }

    public Instant getAtualizadoEm() {
        return this.atualizadoEm;
    }

    public PreCadastro atualizadoEm(Instant atualizadoEm) {
        this.setAtualizadoEm(atualizadoEm);
        return this;
    }

    public void setAtualizadoEm(Instant atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }

    public Endereco getEndereco() {
        return this.endereco;
    }

    public void setEndereco(Endereco endereco) {
        this.endereco = endereco;
    }

    public PreCadastro endereco(Endereco endereco) {
        this.setEndereco(endereco);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof PreCadastro)) {
            return false;
        }
        return getId() != null && getId().equals(((PreCadastro) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "PreCadastro{" +
            "id=" + getId() +
            ", nomeCompleto='" + getNomeCompleto() + "'" +
            ", email='" + getEmail() + "'" +
            ", telefone='" + getTelefone() + "'" +
            ", telefoneSecundario='" + getTelefoneSecundario() + "'" +
            ", telefoneEmergencia='" + getTelefoneEmergencia() + "'" +
            ", nomeContatoEmergencia='" + getNomeContatoEmergencia() + "'" +
            ", cpf='" + getCpf() + "'" +
            ", sexo='" + getSexo() + "'" +
            ", dataNascimento='" + getDataNascimento() + "'" +
            ", login='" + getLogin() + "'" +
            ", senha='" + getSenha() + "'" +
            ", perfilSolicitado='" + getPerfilSolicitado() + "'" +
            ", perfilAprovado='" + getPerfilAprovado() + "'" +
            ", status='" + getStatus() + "'" +
            ", observacoes='" + getObservacoes() + "'" +
            ", criadoEm='" + getCriadoEm() + "'" +
            ", atualizadoEm='" + getAtualizadoEm() + "'" +
            "}";
    }
}
