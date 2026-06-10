package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.PrioridadeSolicitacaoSuporte;
import br.com.semear.domain.enumeration.StatusSolicitacaoSuporte;
import br.com.semear.domain.enumeration.TipoSolicitacaoSuporte;
import java.io.Serializable;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class SolicitacaoSuporteDTO implements Serializable {

    private Long id;
    private Long igrejaId;
    private String igrejaNome;
    private Long usuarioSolicitanteId;
    private String nomeSolicitante;
    private String emailSolicitante;
    private String telefoneSolicitante;
    private TipoSolicitacaoSuporte tipo;
    private PrioridadeSolicitacaoSuporte prioridade;
    private String titulo;
    private String descricao;
    private StatusSolicitacaoSuporte status;
    private String respostaAdmin;
    private Long respondidoPorId;
    private String respondidoPorNome;
    private String observacaoInternaAdmin;
    private Boolean lidaPeloCliente;
    private Boolean lidaPeloSuporte;
    private Instant dataResposta;
    private Instant dataFinalizacao;
    private Instant createdDate;
    private Instant lastModifiedDate;
    private boolean temAnexo;
    private int quantidadeAnexos;
    private List<SolicitacaoSuporteAnexoDTO> anexos = new ArrayList<>();
    private List<SolicitacaoSuporteHistoricoDTO> historico = new ArrayList<>();
    private List<SolicitacaoSuporteMensagemDTO> mensagens = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIgrejaId() {
        return igrejaId;
    }

    public void setIgrejaId(Long igrejaId) {
        this.igrejaId = igrejaId;
    }

    public String getIgrejaNome() {
        return igrejaNome;
    }

    public void setIgrejaNome(String igrejaNome) {
        this.igrejaNome = igrejaNome;
    }

    public Long getUsuarioSolicitanteId() {
        return usuarioSolicitanteId;
    }

    public void setUsuarioSolicitanteId(Long usuarioSolicitanteId) {
        this.usuarioSolicitanteId = usuarioSolicitanteId;
    }

    public String getNomeSolicitante() {
        return nomeSolicitante;
    }

    public void setNomeSolicitante(String nomeSolicitante) {
        this.nomeSolicitante = nomeSolicitante;
    }

    public String getEmailSolicitante() {
        return emailSolicitante;
    }

    public void setEmailSolicitante(String emailSolicitante) {
        this.emailSolicitante = emailSolicitante;
    }

    public String getTelefoneSolicitante() {
        return telefoneSolicitante;
    }

    public void setTelefoneSolicitante(String telefoneSolicitante) {
        this.telefoneSolicitante = telefoneSolicitante;
    }

    public TipoSolicitacaoSuporte getTipo() {
        return tipo;
    }

    public void setTipo(TipoSolicitacaoSuporte tipo) {
        this.tipo = tipo;
    }

    public PrioridadeSolicitacaoSuporte getPrioridade() {
        return prioridade;
    }

    public void setPrioridade(PrioridadeSolicitacaoSuporte prioridade) {
        this.prioridade = prioridade;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public StatusSolicitacaoSuporte getStatus() {
        return status;
    }

    public void setStatus(StatusSolicitacaoSuporte status) {
        this.status = status;
    }

    public String getRespostaAdmin() {
        return respostaAdmin;
    }

    public void setRespostaAdmin(String respostaAdmin) {
        this.respostaAdmin = respostaAdmin;
    }

    public Long getRespondidoPorId() {
        return respondidoPorId;
    }

    public void setRespondidoPorId(Long respondidoPorId) {
        this.respondidoPorId = respondidoPorId;
    }

    public String getRespondidoPorNome() {
        return respondidoPorNome;
    }

    public void setRespondidoPorNome(String respondidoPorNome) {
        this.respondidoPorNome = respondidoPorNome;
    }

    public String getObservacaoInternaAdmin() {
        return observacaoInternaAdmin;
    }

    public void setObservacaoInternaAdmin(String observacaoInternaAdmin) {
        this.observacaoInternaAdmin = observacaoInternaAdmin;
    }

    public Boolean getLidaPeloCliente() {
        return lidaPeloCliente;
    }

    public void setLidaPeloCliente(Boolean lidaPeloCliente) {
        this.lidaPeloCliente = lidaPeloCliente;
    }

    public Boolean getLidaPeloSuporte() {
        return lidaPeloSuporte;
    }

    public void setLidaPeloSuporte(Boolean lidaPeloSuporte) {
        this.lidaPeloSuporte = lidaPeloSuporte;
    }

    public Instant getDataResposta() {
        return dataResposta;
    }

    public void setDataResposta(Instant dataResposta) {
        this.dataResposta = dataResposta;
    }

    public Instant getDataFinalizacao() {
        return dataFinalizacao;
    }

    public void setDataFinalizacao(Instant dataFinalizacao) {
        this.dataFinalizacao = dataFinalizacao;
    }

    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }

    public Instant getLastModifiedDate() {
        return lastModifiedDate;
    }

    public void setLastModifiedDate(Instant lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }

    public boolean isTemAnexo() {
        return temAnexo;
    }

    public void setTemAnexo(boolean temAnexo) {
        this.temAnexo = temAnexo;
    }

    public int getQuantidadeAnexos() {
        return quantidadeAnexos;
    }

    public void setQuantidadeAnexos(int quantidadeAnexos) {
        this.quantidadeAnexos = quantidadeAnexos;
    }

    public List<SolicitacaoSuporteAnexoDTO> getAnexos() {
        return anexos;
    }

    public void setAnexos(List<SolicitacaoSuporteAnexoDTO> anexos) {
        this.anexos = anexos;
    }

    public List<SolicitacaoSuporteHistoricoDTO> getHistorico() {
        return historico;
    }

    public void setHistorico(List<SolicitacaoSuporteHistoricoDTO> historico) {
        this.historico = historico;
    }

    public List<SolicitacaoSuporteMensagemDTO> getMensagens() {
        return mensagens;
    }

    public void setMensagens(List<SolicitacaoSuporteMensagemDTO> mensagens) {
        this.mensagens = mensagens;
    }
}
