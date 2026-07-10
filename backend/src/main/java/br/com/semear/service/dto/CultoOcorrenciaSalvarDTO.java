package br.com.semear.service.dto;

import br.com.semear.domain.enumeration.PapelCultoResponsavel;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/** Payload para salvar/atualizar detalhes de uma ocorrência de culto. */
public class CultoOcorrenciaSalvarDTO implements Serializable {

    private Long cultoRegistroId;
    private LocalDate data;
    private String pregador;
    private String tituloMensagem;
    private String versiculoCentral;
    private String observacoes;
    private Long grupoLouvorOrigemId;
    private List<Long> louvorIds = new ArrayList<>();
    private List<ResponsavelDTO> responsaveisManuais = new ArrayList<>();

    public Long getCultoRegistroId() { return cultoRegistroId; }
    public void setCultoRegistroId(Long cultoRegistroId) { this.cultoRegistroId = cultoRegistroId; }
    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
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
    public List<Long> getLouvorIds() { return louvorIds; }
    public void setLouvorIds(List<Long> louvorIds) { this.louvorIds = louvorIds; }
    public List<ResponsavelDTO> getResponsaveisManuais() { return responsaveisManuais; }
    public void setResponsaveisManuais(List<ResponsavelDTO> responsaveisManuais) {
        this.responsaveisManuais = responsaveisManuais;
    }

    public static class ResponsavelDTO implements Serializable {
        private PapelCultoResponsavel papel;
        private Long userId;

        public PapelCultoResponsavel getPapel() { return papel; }
        public void setPapel(PapelCultoResponsavel papel) { this.papel = papel; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
    }
}
