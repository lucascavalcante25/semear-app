package br.com.semear.service.mapper;

import br.com.semear.domain.Comunicado;
import br.com.semear.domain.ComunicadoLeitura;
import br.com.semear.domain.User;
import br.com.semear.service.dto.ComunicadoDTO;
import br.com.semear.service.dto.ComunicadoLeituraDTO;
import br.com.semear.service.util.ConfigNotificacaoJsonUtil;
import org.springframework.stereotype.Service;

@Service
public class ComunicadoMapper {

    public ComunicadoDTO toDto(Comunicado comunicado) {
        return toDto(comunicado, null);
    }

    public ComunicadoDTO toDto(Comunicado comunicado, Boolean lido) {
        if (comunicado == null) {
            return null;
        }
        ComunicadoDTO dto = new ComunicadoDTO();
        dto.setId(comunicado.getId());
        if (comunicado.getIgreja() != null) {
            dto.setIgrejaId(comunicado.getIgreja().getId());
        }
        dto.setTitulo(comunicado.getTitulo());
        dto.setConteudo(comunicado.getConteudo());
        dto.setTipo(comunicado.getTipo());
        dto.setPublicoAlvo(comunicado.getPublicoAlvo());
        dto.setPrioridade(comunicado.getPrioridade());
        dto.setExibirNoLogin(comunicado.getExibirNoLogin());
        dto.setObrigatorio(comunicado.getObrigatorio());
        dto.setExibirNoSitePublico(comunicado.getExibirNoSitePublico());
        dto.setAtivo(comunicado.getAtivo());
        dto.setDataInicio(comunicado.getDataInicio());
        dto.setDataFim(comunicado.getDataFim());
        dto.setCtaRotulo(comunicado.getCtaRotulo());
        dto.setCtaRota(comunicado.getCtaRota());
        dto.setImagemUrl(comunicado.getImagemUrl());
        dto.setCriadoPor(comunicado.getCriadoPor());
        dto.setCriadoEm(comunicado.getCriadoEm());
        dto.setAtualizadoEm(comunicado.getAtualizadoEm());
        dto.setAtualizadoPor(comunicado.getAtualizadoPor());
        dto.setLido(lido);
        dto.setConfigNotificacao(ConfigNotificacaoJsonUtil.parse(comunicado.getConfigNotificacao()));
        return dto;
    }

    public ComunicadoLeituraDTO toLeituraDto(ComunicadoLeitura leitura) {
        if (leitura == null) {
            return null;
        }
        ComunicadoLeituraDTO dto = new ComunicadoLeituraDTO();
        dto.setId(leitura.getId());
        if (leitura.getUsuario() != null) {
            dto.setUsuarioId(leitura.getUsuario().getId());
            dto.setUsuarioNome(montarNomeUsuario(leitura.getUsuario()));
        }
        dto.setConfirmadoEm(leitura.getConfirmadoEm());
        return dto;
    }

    private String montarNomeUsuario(User user) {
        String primeiro = user.getFirstName() != null ? user.getFirstName().trim() : "";
        String ultimo = user.getLastName() != null ? user.getLastName().trim() : "";
        String nome = (primeiro + " " + ultimo).trim();
        if (!nome.isBlank()) {
            return nome;
        }
        return user.getLogin();
    }
}
