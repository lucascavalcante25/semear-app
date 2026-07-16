package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.PapelCultoResponsavel;
import br.com.semear.domain.enumeration.TipoCulto;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class CultoAgendaItemDTO implements Serializable {

    private Long ocorrenciaId;
    private Long cultoRegistroId;
    private String nome;
    private TipoCulto tipo;
    private LocalDate data;
    private String horario;
    private String pregador;
    private String tituloMensagem;
    private String versiculoCentral;
    private String observacoes;
    private Long grupoLouvorOrigemId;
    private String grupoLouvorOrigemNome;
    private List<CultoLouvorItemDTO> louvores = new ArrayList<>();
    private List<CultoResponsavelDTO> responsaveis = new ArrayList<>();
    private boolean temOverrideResponsaveis;
    private boolean temEscalaGerada;
    private boolean cancelado;
    private String motivoCancelamento;
    private Instant canceladoEm;

    public Long getOcorrenciaId() { return ocorrenciaId; }
    public void setOcorrenciaId(Long ocorrenciaId) { this.ocorrenciaId = ocorrenciaId; }
    public Long getCultoRegistroId() { return cultoRegistroId; }
    public void setCultoRegistroId(Long cultoRegistroId) { this.cultoRegistroId = cultoRegistroId; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public TipoCulto getTipo() { return tipo; }
    public void setTipo(TipoCulto tipo) { this.tipo = tipo; }
    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
    public String getHorario() { return horario; }
    public void setHorario(String horario) { this.horario = horario; }
    public String getPregador() { return pregador; }
    public void setPregador(String pregador) { this.pregador = pregador; }
    public String getTituloMensagem() { return tituloMensagem; }
    public void setTituloMensagem(String tituloMensagem) { this.tituloMensagem = tituloMensagem; }
    public String getVersiculoCentral() { return versiculoCentral; }
    public void setVersiculoCentral(String versiculoCentral) { this.versiculoCentral = versiculoCentral; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    public Long getGrupoLouvorOrigemId() { return grupoLouvorOrigemId; }
    public void setGrupoLouvorOrigemId(Long grupoLouvorOrigemId) { this.grupoLouvorOrigemId = grupoLouvorOrigemId; }
    public String getGrupoLouvorOrigemNome() { return grupoLouvorOrigemNome; }
    public void setGrupoLouvorOrigemNome(String grupoLouvorOrigemNome) { this.grupoLouvorOrigemNome = grupoLouvorOrigemNome; }
    public List<CultoLouvorItemDTO> getLouvores() { return louvores; }
    public void setLouvores(List<CultoLouvorItemDTO> louvores) { this.louvores = louvores; }
    public List<CultoResponsavelDTO> getResponsaveis() { return responsaveis; }
    public void setResponsaveis(List<CultoResponsavelDTO> responsaveis) { this.responsaveis = responsaveis; }
    public boolean isTemOverrideResponsaveis() { return temOverrideResponsaveis; }
    public void setTemOverrideResponsaveis(boolean temOverrideResponsaveis) {
        this.temOverrideResponsaveis = temOverrideResponsaveis;
    }
    public boolean isTemEscalaGerada() { return temEscalaGerada; }
    public void setTemEscalaGerada(boolean temEscalaGerada) { this.temEscalaGerada = temEscalaGerada; }
    public boolean isCancelado() { return cancelado; }
    public void setCancelado(boolean cancelado) { this.cancelado = cancelado; }
    public String getMotivoCancelamento() { return motivoCancelamento; }
    public void setMotivoCancelamento(String motivoCancelamento) { this.motivoCancelamento = motivoCancelamento; }
    public Instant getCanceladoEm() { return canceladoEm; }
    public void setCanceladoEm(Instant canceladoEm) { this.canceladoEm = canceladoEm; }

    public static class CultoLouvorItemDTO implements Serializable {
        private Long louvorId;
        private String titulo;
        private String artista;
        private Integer ordem;
        private String youtubeUrl;
        private String tonalidade;
        private Boolean temLetraSalva;
        private Boolean temCifraApiSalva;

        public Long getLouvorId() { return louvorId; }
        public void setLouvorId(Long louvorId) { this.louvorId = louvorId; }
        public String getTitulo() { return titulo; }
        public void setTitulo(String titulo) { this.titulo = titulo; }
        public String getArtista() { return artista; }
        public void setArtista(String artista) { this.artista = artista; }
        public Integer getOrdem() { return ordem; }
        public void setOrdem(Integer ordem) { this.ordem = ordem; }
        public String getYoutubeUrl() { return youtubeUrl; }
        public void setYoutubeUrl(String youtubeUrl) { this.youtubeUrl = youtubeUrl; }
        public String getTonalidade() { return tonalidade; }
        public void setTonalidade(String tonalidade) { this.tonalidade = tonalidade; }
        public Boolean getTemLetraSalva() { return temLetraSalva; }
        public void setTemLetraSalva(Boolean temLetraSalva) { this.temLetraSalva = temLetraSalva; }
        public Boolean getTemCifraApiSalva() { return temCifraApiSalva; }
        public void setTemCifraApiSalva(Boolean temCifraApiSalva) { this.temCifraApiSalva = temCifraApiSalva; }
    }

    public static class CultoResponsavelDTO implements Serializable {
        private PapelCultoResponsavel papel;
        private Long userId;
        private String nome;
        private boolean origemManual;

        public PapelCultoResponsavel getPapel() { return papel; }
        public void setPapel(PapelCultoResponsavel papel) { this.papel = papel; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getNome() { return nome; }
        public void setNome(String nome) { this.nome = nome; }
        public boolean isOrigemManual() { return origemManual; }
        public void setOrigemManual(boolean origemManual) { this.origemManual = origemManual; }
    }
}
