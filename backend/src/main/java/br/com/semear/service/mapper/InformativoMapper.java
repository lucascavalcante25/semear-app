package br.com.semear.service.mapper;

import br.com.semear.domain.Informativo;
import br.com.semear.domain.InformativoLeitura;
import br.com.semear.domain.User;
import br.com.semear.service.dto.InformativoDTO;
import br.com.semear.service.dto.InformativoLeituraDTO;
import org.springframework.stereotype.Service;

@Service
public class InformativoMapper {

    public InformativoDTO toDto(Informativo informativo) {
        return toDto(informativo, null);
    }

    public InformativoDTO toDto(Informativo informativo, Boolean lido) {
        if (informativo == null) {
            return null;
        }
        InformativoDTO dto = new InformativoDTO();
        dto.setId(informativo.getId());
        if (informativo.getIgreja() != null) {
            dto.setIgrejaId(informativo.getIgreja().getId());
        }
        dto.setTitulo(informativo.getTitulo());
        dto.setConteudo(informativo.getConteudo());
        dto.setTipo(informativo.getTipo());
        dto.setPublicoAlvo(informativo.getPublicoAlvo());
        dto.setPrioridade(informativo.getPrioridade());
        dto.setExibirNoLogin(informativo.getExibirNoLogin());
        dto.setObrigatorio(informativo.getObrigatorio());
        dto.setAtivo(informativo.getAtivo());
        dto.setDataInicio(informativo.getDataInicio());
        dto.setDataFim(informativo.getDataFim());
        dto.setCtaRotulo(informativo.getCtaRotulo());
        dto.setCtaRota(informativo.getCtaRota());
        dto.setImagemUrl(informativo.getImagemUrl());
        if (informativo.getCriadoPor() != null) {
            dto.setCriadoPorId(informativo.getCriadoPor().getId());
            dto.setCriadoPorNome(montarNomeUsuario(informativo.getCriadoPor()));
        }
        dto.setCriadoEm(informativo.getCriadoEm());
        dto.setAtualizadoEm(informativo.getAtualizadoEm());
        dto.setLido(lido);
        return dto;
    }

    public InformativoLeituraDTO toLeituraDto(InformativoLeitura leitura) {
        if (leitura == null) {
            return null;
        }
        InformativoLeituraDTO dto = new InformativoLeituraDTO();
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
