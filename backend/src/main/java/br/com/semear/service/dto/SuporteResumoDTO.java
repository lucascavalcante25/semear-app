package br.com.semear.service.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class SuporteResumoDTO implements Serializable {

    private long abertas;
    private long emAnalise;
    private long respondidas;
    private long resolvidas;
    private long finalizadas;
    private long canceladas;
    private long aguardandoRespostaSuporte;

    public long getAbertas() {
        return abertas;
    }

    public void setAbertas(long abertas) {
        this.abertas = abertas;
    }

    public long getEmAnalise() {
        return emAnalise;
    }

    public void setEmAnalise(long emAnalise) {
        this.emAnalise = emAnalise;
    }

    public long getRespondidas() {
        return respondidas;
    }

    public void setRespondidas(long respondidas) {
        this.respondidas = respondidas;
    }

    public long getResolvidas() {
        return resolvidas;
    }

    public void setResolvidas(long resolvidas) {
        this.resolvidas = resolvidas;
    }

    public long getFinalizadas() {
        return finalizadas;
    }

    public void setFinalizadas(long finalizadas) {
        this.finalizadas = finalizadas;
    }

    public long getCanceladas() {
        return canceladas;
    }

    public void setCanceladas(long canceladas) {
        this.canceladas = canceladas;
    }

    public long getAguardandoRespostaSuporte() {
        return aguardandoRespostaSuporte;
    }

    public void setAguardandoRespostaSuporte(long aguardandoRespostaSuporte) {
        this.aguardandoRespostaSuporte = aguardandoRespostaSuporte;
    }

    public static class UltimaSolicitacaoDTO implements Serializable {

        private Long id;
        private String igrejaNome;
        private String tipo;
        private String titulo;
        private String status;
        private String createdDate;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getIgrejaNome() {
            return igrejaNome;
        }

        public void setIgrejaNome(String igrejaNome) {
            this.igrejaNome = igrejaNome;
        }

        public String getTipo() {
            return tipo;
        }

        public void setTipo(String tipo) {
            this.tipo = tipo;
        }

        public String getTitulo() {
            return titulo;
        }

        public void setTitulo(String titulo) {
            this.titulo = titulo;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getCreatedDate() {
            return createdDate;
        }

        public void setCreatedDate(String createdDate) {
            this.createdDate = createdDate;
        }
    }

    private List<UltimaSolicitacaoDTO> ultimas = new ArrayList<>();

    public List<UltimaSolicitacaoDTO> getUltimas() {
        return ultimas;
    }

    public void setUltimas(List<UltimaSolicitacaoDTO> ultimas) {
        this.ultimas = ultimas;
    }
}
