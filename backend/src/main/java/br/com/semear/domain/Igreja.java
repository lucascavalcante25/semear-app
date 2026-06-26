package br.com.semear.domain;

import br.com.semear.domain.enumeration.StatusIgreja;
import br.com.semear.domain.enumeration.Tema;
import br.com.semear.domain.enumeration.TipoChavePix;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * Dados institucionais e de configuração de uma igreja cliente.
 */
@Entity
@Table(name = "igreja")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Igreja implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "nome_fantasia")
    private String nomeFantasia;

    @Column(name = "cnpj", length = 20)
    private String cnpj;

    @Column(name = "email")
    private String email;

    @Column(name = "telefone", length = 50)
    private String telefone;

    @Column(name = "cep", length = 20)
    private String cep;

    @Column(name = "endereco")
    private String endereco;

    @Column(name = "numero", length = 50)
    private String numero;

    @Column(name = "bairro", length = 100)
    private String bairro;

    @Column(name = "cidade", length = 100)
    private String cidade;

    @Column(name = "estado", length = 2)
    private String estado;

    @Column(name = "complemento")
    private String complemento;

    @Column(name = "nome_pastor_responsavel")
    private String nomePastorResponsavel;

    @Column(name = "cpf_pastor_responsavel", length = 20)
    private String cpfPastorResponsavel;

    @Column(name = "telefone_responsavel", length = 50)
    private String telefoneResponsavel;

    @Column(name = "email_responsavel")
    private String emailResponsavel;

    @Column(name = "chave_pix")
    private String chavePix;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_chave_pix", length = 30)
    private TipoChavePix tipoChavePix;

    @Column(name = "nome_titular_pix")
    private String nomeTitularPix;

    @Column(name = "banco_pix")
    private String bancoPix;

    @Column(name = "documento_titular_pix", length = 30)
    private String documentoTitularPix;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "cor_primaria", length = 20)
    private String corPrimaria;

    @Column(name = "cor_secundaria", length = 20)
    private String corSecundaria;

    @Enumerated(EnumType.STRING)
    @Column(name = "tema_preferido", length = 20)
    private Tema temaPreferido;

    @Column(name = "texto_boas_vindas", columnDefinition = "text")
    private String textoBoasVindas;

    @Column(name = "descricao_igreja", columnDefinition = "text")
    private String descricaoIgreja;

    @Column(name = "subtitulo_igreja", length = 255)
    private String subtituloIgreja;

    @Column(name = "slug", length = 120)
    private String slug;

    @Column(name = "horario_culto", length = 255)
    private String horarioCulto;

    @NotNull
    @Column(name = "site_ativo", nullable = false)
    private Boolean siteAtivo = false;

    @NotNull
    @Column(name = "exibir_comunicados_publicos", nullable = false)
    private Boolean exibirComunicadosPublicos = true;

    @Column(name = "texto_agradecimento_oferta", columnDefinition = "text")
    private String textoAgradecimentoOferta;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StatusIgreja status = StatusIgreja.ATIVA;

    @NotNull
    @Column(name = "data_cadastro", nullable = false)
    private Instant dataCadastro;

    @Column(name = "data_atualizacao")
    private Instant dataAtualizacao;

    @Column(name = "data_inicio_plano_leitura")
    private LocalDate dataInicioPlanoLeitura;

    @Column(name = "ciclo_plano_leitura", nullable = false)
    private Integer cicloPlanoLeitura = 1;

    @NotNull
    @Column(name = "requer_aprovacao_oracao_publica", nullable = false)
    private Boolean requerAprovacaoOracaoPublica = true;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getNomeFantasia() {
        return nomeFantasia;
    }

    public void setNomeFantasia(String nomeFantasia) {
        this.nomeFantasia = nomeFantasia;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
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

    public String getBairro() {
        return bairro;
    }

    public void setBairro(String bairro) {
        this.bairro = bairro;
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

    public String getComplemento() {
        return complemento;
    }

    public void setComplemento(String complemento) {
        this.complemento = complemento;
    }

    public String getNomePastorResponsavel() {
        return nomePastorResponsavel;
    }

    public void setNomePastorResponsavel(String nomePastorResponsavel) {
        this.nomePastorResponsavel = nomePastorResponsavel;
    }

    public String getCpfPastorResponsavel() {
        return cpfPastorResponsavel;
    }

    public void setCpfPastorResponsavel(String cpfPastorResponsavel) {
        this.cpfPastorResponsavel = cpfPastorResponsavel;
    }

    public String getTelefoneResponsavel() {
        return telefoneResponsavel;
    }

    public void setTelefoneResponsavel(String telefoneResponsavel) {
        this.telefoneResponsavel = telefoneResponsavel;
    }

    public String getEmailResponsavel() {
        return emailResponsavel;
    }

    public void setEmailResponsavel(String emailResponsavel) {
        this.emailResponsavel = emailResponsavel;
    }

    public String getChavePix() {
        return chavePix;
    }

    public void setChavePix(String chavePix) {
        this.chavePix = chavePix;
    }

    public TipoChavePix getTipoChavePix() {
        return tipoChavePix;
    }

    public void setTipoChavePix(TipoChavePix tipoChavePix) {
        this.tipoChavePix = tipoChavePix;
    }

    public String getNomeTitularPix() {
        return nomeTitularPix;
    }

    public void setNomeTitularPix(String nomeTitularPix) {
        this.nomeTitularPix = nomeTitularPix;
    }

    public String getBancoPix() {
        return bancoPix;
    }

    public void setBancoPix(String bancoPix) {
        this.bancoPix = bancoPix;
    }

    public String getDocumentoTitularPix() {
        return documentoTitularPix;
    }

    public void setDocumentoTitularPix(String documentoTitularPix) {
        this.documentoTitularPix = documentoTitularPix;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getCorPrimaria() {
        return corPrimaria;
    }

    public void setCorPrimaria(String corPrimaria) {
        this.corPrimaria = corPrimaria;
    }

    public String getCorSecundaria() {
        return corSecundaria;
    }

    public void setCorSecundaria(String corSecundaria) {
        this.corSecundaria = corSecundaria;
    }

    public Tema getTemaPreferido() {
        return temaPreferido;
    }

    public void setTemaPreferido(Tema temaPreferido) {
        this.temaPreferido = temaPreferido;
    }

    public String getTextoBoasVindas() {
        return textoBoasVindas;
    }

    public void setTextoBoasVindas(String textoBoasVindas) {
        this.textoBoasVindas = textoBoasVindas;
    }

    public String getDescricaoIgreja() {
        return descricaoIgreja;
    }

    public void setDescricaoIgreja(String descricaoIgreja) {
        this.descricaoIgreja = descricaoIgreja;
    }

    public String getSubtituloIgreja() {
        return subtituloIgreja;
    }

    public void setSubtituloIgreja(String subtituloIgreja) {
        this.subtituloIgreja = subtituloIgreja;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getHorarioCulto() {
        return horarioCulto;
    }

    public void setHorarioCulto(String horarioCulto) {
        this.horarioCulto = horarioCulto;
    }

    public Boolean getSiteAtivo() {
        return siteAtivo;
    }

    public void setSiteAtivo(Boolean siteAtivo) {
        this.siteAtivo = siteAtivo;
    }

    public Boolean getExibirComunicadosPublicos() {
        return exibirComunicadosPublicos;
    }

    public void setExibirComunicadosPublicos(Boolean exibirComunicadosPublicos) {
        this.exibirComunicadosPublicos = exibirComunicadosPublicos;
    }

    public String getTextoAgradecimentoOferta() {
        return textoAgradecimentoOferta;
    }

    public void setTextoAgradecimentoOferta(String textoAgradecimentoOferta) {
        this.textoAgradecimentoOferta = textoAgradecimentoOferta;
    }

    public StatusIgreja getStatus() {
        return status;
    }

    public void setStatus(StatusIgreja status) {
        this.status = status;
    }

    public Instant getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(Instant dataCadastro) {
        this.dataCadastro = dataCadastro;
    }

    public Instant getDataAtualizacao() {
        return dataAtualizacao;
    }

    public void setDataAtualizacao(Instant dataAtualizacao) {
        this.dataAtualizacao = dataAtualizacao;
    }

    public LocalDate getDataInicioPlanoLeitura() {
        return dataInicioPlanoLeitura;
    }

    public void setDataInicioPlanoLeitura(LocalDate dataInicioPlanoLeitura) {
        this.dataInicioPlanoLeitura = dataInicioPlanoLeitura;
    }

    public Integer getCicloPlanoLeitura() {
        return cicloPlanoLeitura;
    }

    public void setCicloPlanoLeitura(Integer cicloPlanoLeitura) {
        this.cicloPlanoLeitura = cicloPlanoLeitura;
    }

    public Boolean getRequerAprovacaoOracaoPublica() {
        return requerAprovacaoOracaoPublica;
    }

    public void setRequerAprovacaoOracaoPublica(Boolean requerAprovacaoOracaoPublica) {
        this.requerAprovacaoOracaoPublica = requerAprovacaoOracaoPublica;
    }
}
