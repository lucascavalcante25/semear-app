package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.Sexo;
import br.com.semear.domain.enumeration.StatusSolicitacaoAcesso;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;

public class SolicitacaoAcessoDTO implements Serializable {

    private Long id;
    private String nomeSolicitante;
    private String cpf;
    private String email;
    private String telefone;
    private String telefoneSecundario;
    private String telefoneEmergencia;
    private String nomeContatoEmergencia;
    private LocalDate dataNascimento;
    private Sexo sexo;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String senha;

    private String cepPessoal;
    private String enderecoPessoal;
    private String numeroPessoal;
    private String complementoPessoal;
    private String bairroPessoal;
    private String cidadePessoal;
    private String estadoPessoal;

    private String nomeIgreja;
    private String cnpjIgreja;
    private String cep;
    private String endereco;
    private String numero;
    private String complemento;
    private String bairro;
    private Integer quantidadeMembros;
    private String cidade;
    private String estado;
    private String mensagem;
    private StatusSolicitacaoAcesso status;
    private Instant dataSolicitacao;
    private Instant dataAnalise;
    private String observacaoAdmin;
    private Long igrejaCriadaId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNomeSolicitante() { return nomeSolicitante; }
    public void setNomeSolicitante(String v) { this.nomeSolicitante = v; }
    public String getCpf() { return cpf; }
    public void setCpf(String v) { this.cpf = v; }
    public String getEmail() { return email; }
    public void setEmail(String v) { this.email = v; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String v) { this.telefone = v; }
    public String getTelefoneSecundario() { return telefoneSecundario; }
    public void setTelefoneSecundario(String v) { this.telefoneSecundario = v; }
    public String getTelefoneEmergencia() { return telefoneEmergencia; }
    public void setTelefoneEmergencia(String v) { this.telefoneEmergencia = v; }
    public String getNomeContatoEmergencia() { return nomeContatoEmergencia; }
    public void setNomeContatoEmergencia(String v) { this.nomeContatoEmergencia = v; }
    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate v) { this.dataNascimento = v; }
    public Sexo getSexo() { return sexo; }
    public void setSexo(Sexo v) { this.sexo = v; }
    public String getSenha() { return senha; }
    public void setSenha(String v) { this.senha = v; }
    public String getCepPessoal() { return cepPessoal; }
    public void setCepPessoal(String v) { this.cepPessoal = v; }
    public String getEnderecoPessoal() { return enderecoPessoal; }
    public void setEnderecoPessoal(String v) { this.enderecoPessoal = v; }
    public String getNumeroPessoal() { return numeroPessoal; }
    public void setNumeroPessoal(String v) { this.numeroPessoal = v; }
    public String getComplementoPessoal() { return complementoPessoal; }
    public void setComplementoPessoal(String v) { this.complementoPessoal = v; }
    public String getBairroPessoal() { return bairroPessoal; }
    public void setBairroPessoal(String v) { this.bairroPessoal = v; }
    public String getCidadePessoal() { return cidadePessoal; }
    public void setCidadePessoal(String v) { this.cidadePessoal = v; }
    public String getEstadoPessoal() { return estadoPessoal; }
    public void setEstadoPessoal(String v) { this.estadoPessoal = v; }
    public String getNomeIgreja() { return nomeIgreja; }
    public void setNomeIgreja(String v) { this.nomeIgreja = v; }
    public String getCnpjIgreja() { return cnpjIgreja; }
    public void setCnpjIgreja(String v) { this.cnpjIgreja = v; }
    public String getCep() { return cep; }
    public void setCep(String v) { this.cep = v; }
    public String getEndereco() { return endereco; }
    public void setEndereco(String v) { this.endereco = v; }
    public String getNumero() { return numero; }
    public void setNumero(String v) { this.numero = v; }
    public String getComplemento() { return complemento; }
    public void setComplemento(String v) { this.complemento = v; }
    public String getBairro() { return bairro; }
    public void setBairro(String v) { this.bairro = v; }
    public Integer getQuantidadeMembros() { return quantidadeMembros; }
    public void setQuantidadeMembros(Integer v) { this.quantidadeMembros = v; }
    public String getCidade() { return cidade; }
    public void setCidade(String v) { this.cidade = v; }
    public String getEstado() { return estado; }
    public void setEstado(String v) { this.estado = v; }
    public String getMensagem() { return mensagem; }
    public void setMensagem(String v) { this.mensagem = v; }
    public StatusSolicitacaoAcesso getStatus() { return status; }
    public void setStatus(StatusSolicitacaoAcesso v) { this.status = v; }
    public Instant getDataSolicitacao() { return dataSolicitacao; }
    public void setDataSolicitacao(Instant v) { this.dataSolicitacao = v; }
    public Instant getDataAnalise() { return dataAnalise; }
    public void setDataAnalise(Instant v) { this.dataAnalise = v; }
    public String getObservacaoAdmin() { return observacaoAdmin; }
    public void setObservacaoAdmin(String v) { this.observacaoAdmin = v; }
    public Long getIgrejaCriadaId() { return igrejaCriadaId; }
    public void setIgrejaCriadaId(Long v) { this.igrejaCriadaId = v; }
}
