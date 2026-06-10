package br.com.semear.domain;

import br.com.semear.domain.enumeration.Sexo;
import br.com.semear.domain.enumeration.StatusSolicitacaoAcesso;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "solicitacao_acesso")
public class SolicitacaoAcesso implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @Column(name = "nome_solicitante", nullable = false)
    private String nomeSolicitante;

    @NotNull
    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "telefone", length = 50)
    private String telefone;

    @Column(name = "cpf", length = 14)
    private String cpf;

    @Column(name = "telefone_secundario", length = 50)
    private String telefoneSecundario;

    @Column(name = "telefone_emergencia", length = 50)
    private String telefoneEmergencia;

    @Column(name = "nome_contato_emergencia", length = 255)
    private String nomeContatoEmergencia;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    @Enumerated(EnumType.STRING)
    @Column(name = "sexo", length = 20)
    private Sexo sexo;

    @Column(name = "senha", length = 255)
    private String senha;

    @Column(name = "cep_pessoal", length = 10)
    private String cepPessoal;

    @Column(name = "endereco_pessoal", length = 255)
    private String enderecoPessoal;

    @Column(name = "numero_pessoal", length = 20)
    private String numeroPessoal;

    @Column(name = "complemento_pessoal", length = 100)
    private String complementoPessoal;

    @Column(name = "bairro_pessoal", length = 100)
    private String bairroPessoal;

    @Column(name = "cidade_pessoal", length = 100)
    private String cidadePessoal;

    @Column(name = "estado_pessoal", length = 2)
    private String estadoPessoal;

    @NotNull
    @Column(name = "nome_igreja", nullable = false)
    private String nomeIgreja;

    @Column(name = "cnpj_igreja", length = 20)
    private String cnpjIgreja;

    @Column(name = "cep", length = 10)
    private String cep;

    @Column(name = "endereco", length = 255)
    private String endereco;

    @Column(name = "numero", length = 20)
    private String numero;

    @Column(name = "complemento", length = 100)
    private String complemento;

    @Column(name = "bairro", length = 100)
    private String bairro;

    @Column(name = "quantidade_membros")
    private Integer quantidadeMembros;

    @Column(name = "cidade", length = 100)
    private String cidade;

    @Column(name = "estado", length = 2)
    private String estado;

    @Column(name = "mensagem", columnDefinition = "text")
    private String mensagem;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StatusSolicitacaoAcesso status = StatusSolicitacaoAcesso.PENDENTE;

    @NotNull
    @Column(name = "data_solicitacao", nullable = false)
    private Instant dataSolicitacao;

    @Column(name = "data_analise")
    private Instant dataAnalise;

    @Column(name = "observacao_admin", columnDefinition = "text")
    private String observacaoAdmin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "igreja_criada_id")
    private Igreja igrejaCriada;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomeSolicitante() {
        return nomeSolicitante;
    }

    public void setNomeSolicitante(String nomeSolicitante) {
        this.nomeSolicitante = nomeSolicitante;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getTelefoneSecundario() {
        return telefoneSecundario;
    }

    public void setTelefoneSecundario(String telefoneSecundario) {
        this.telefoneSecundario = telefoneSecundario;
    }

    public String getTelefoneEmergencia() {
        return telefoneEmergencia;
    }

    public void setTelefoneEmergencia(String telefoneEmergencia) {
        this.telefoneEmergencia = telefoneEmergencia;
    }

    public String getNomeContatoEmergencia() {
        return nomeContatoEmergencia;
    }

    public void setNomeContatoEmergencia(String nomeContatoEmergencia) {
        this.nomeContatoEmergencia = nomeContatoEmergencia;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public Sexo getSexo() {
        return sexo;
    }

    public void setSexo(Sexo sexo) {
        this.sexo = sexo;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getCepPessoal() {
        return cepPessoal;
    }

    public void setCepPessoal(String cepPessoal) {
        this.cepPessoal = cepPessoal;
    }

    public String getEnderecoPessoal() {
        return enderecoPessoal;
    }

    public void setEnderecoPessoal(String enderecoPessoal) {
        this.enderecoPessoal = enderecoPessoal;
    }

    public String getNumeroPessoal() {
        return numeroPessoal;
    }

    public void setNumeroPessoal(String numeroPessoal) {
        this.numeroPessoal = numeroPessoal;
    }

    public String getComplementoPessoal() {
        return complementoPessoal;
    }

    public void setComplementoPessoal(String complementoPessoal) {
        this.complementoPessoal = complementoPessoal;
    }

    public String getBairroPessoal() {
        return bairroPessoal;
    }

    public void setBairroPessoal(String bairroPessoal) {
        this.bairroPessoal = bairroPessoal;
    }

    public String getCidadePessoal() {
        return cidadePessoal;
    }

    public void setCidadePessoal(String cidadePessoal) {
        this.cidadePessoal = cidadePessoal;
    }

    public String getEstadoPessoal() {
        return estadoPessoal;
    }

    public void setEstadoPessoal(String estadoPessoal) {
        this.estadoPessoal = estadoPessoal;
    }

    public String getNomeIgreja() {
        return nomeIgreja;
    }

    public void setNomeIgreja(String nomeIgreja) {
        this.nomeIgreja = nomeIgreja;
    }

    public String getCnpjIgreja() {
        return cnpjIgreja;
    }

    public void setCnpjIgreja(String cnpjIgreja) {
        this.cnpjIgreja = cnpjIgreja;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getComplemento() {
        return complemento;
    }

    public void setComplemento(String complemento) {
        this.complemento = complemento;
    }

    public String getBairro() {
        return bairro;
    }

    public void setBairro(String bairro) {
        this.bairro = bairro;
    }

    public Integer getQuantidadeMembros() {
        return quantidadeMembros;
    }

    public void setQuantidadeMembros(Integer quantidadeMembros) {
        this.quantidadeMembros = quantidadeMembros;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }

    public StatusSolicitacaoAcesso getStatus() {
        return status;
    }

    public void setStatus(StatusSolicitacaoAcesso status) {
        this.status = status;
    }

    public Instant getDataSolicitacao() {
        return dataSolicitacao;
    }

    public void setDataSolicitacao(Instant dataSolicitacao) {
        this.dataSolicitacao = dataSolicitacao;
    }

    public Instant getDataAnalise() {
        return dataAnalise;
    }

    public void setDataAnalise(Instant dataAnalise) {
        this.dataAnalise = dataAnalise;
    }

    public String getObservacaoAdmin() {
        return observacaoAdmin;
    }

    public void setObservacaoAdmin(String observacaoAdmin) {
        this.observacaoAdmin = observacaoAdmin;
    }

    public Igreja getIgrejaCriada() {
        return igrejaCriada;
    }

    public void setIgrejaCriada(Igreja igrejaCriada) {
        this.igrejaCriada = igrejaCriada;
    }
}
