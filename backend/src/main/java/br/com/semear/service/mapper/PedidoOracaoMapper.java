package br.com.semear.service.mapper;

import br.com.semear.domain.PedidoOracao;
import br.com.semear.domain.User;
import br.com.semear.service.dto.PedidoOracaoDTO;
import org.springframework.stereotype.Service;

@Service
public class PedidoOracaoMapper {

    public PedidoOracaoDTO toDto(PedidoOracao pedido, User viewer, boolean ocultarAutor) {
        if (pedido == null) {
            return null;
        }
        PedidoOracaoDTO dto = new PedidoOracaoDTO();
        dto.setId(pedido.getId());
        if (pedido.getIgreja() != null) {
            dto.setIgrejaId(pedido.getIgreja().getId());
        }
        if (pedido.getUsuario() != null) {
            dto.setUsuarioId(pedido.getUsuario().getId());
            if (!ocultarAutor) {
                dto.setUsuarioNome(montarNomeUsuario(pedido.getUsuario()));
            }
        } else if (!ocultarAutor && pedido.getNomeSolicitante() != null) {
            dto.setUsuarioNome(pedido.getNomeSolicitante());
        }
        dto.setNomeSolicitante(pedido.getNomeSolicitante());
        dto.setTitulo(pedido.getTitulo());
        dto.setDescricao(pedido.getDescricao());
        dto.setCategoria(pedido.getCategoria());
        dto.setVisibilidade(pedido.getVisibilidade());
        dto.setStatus(pedido.getStatus());
        dto.setAnonimo(pedido.getAnonimo());
        dto.setRequerAprovacao(pedido.getRequerAprovacao());
        dto.setAprovado(pedido.getAprovado());
        if (pedido.getAprovadoPor() != null) {
            dto.setAprovadoPorId(pedido.getAprovadoPor().getId());
            dto.setAprovadoPorNome(montarNomeUsuario(pedido.getAprovadoPor()));
        }
        dto.setAprovadoEm(pedido.getAprovadoEm());
        dto.setRespostaTexto(pedido.getRespostaTexto());
        dto.setRespondidoEm(pedido.getRespondidoEm());
        dto.setCriadoEm(pedido.getCriadoEm());
        dto.setAtualizadoEm(pedido.getAtualizadoEm());
        dto.setDenunciado(pedido.getDenunciado());
        dto.setDenunciadoEm(pedido.getDenunciadoEm());
        if (pedido.getDenunciadoPor() != null) {
            dto.setDenunciadoPorId(pedido.getDenunciadoPor().getId());
            dto.setDenunciadoPorNome(montarNomeUsuario(pedido.getDenunciadoPor()));
        }
        return dto;
    }

    public String montarNomeUsuario(User user) {
        if (user == null) {
            return null;
        }
        String primeiro = user.getFirstName() != null ? user.getFirstName().trim() : "";
        String ultimo = user.getLastName() != null ? user.getLastName().trim() : "";
        String nome = (primeiro + " " + ultimo).trim();
        if (!nome.isBlank()) {
            return nome;
        }
        return user.getLogin();
    }
}
