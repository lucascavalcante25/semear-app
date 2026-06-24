package br.com.semear.service.mapper;

import br.com.semear.domain.DocumentoIgreja;
import br.com.semear.domain.User;
import br.com.semear.service.dto.DocumentoIgrejaDTO;
import org.springframework.stereotype.Service;

@Service
public class DocumentoIgrejaMapper {

    public DocumentoIgrejaDTO toDto(DocumentoIgreja documento) {
        if (documento == null) {
            return null;
        }
        DocumentoIgrejaDTO dto = new DocumentoIgrejaDTO();
        dto.setId(documento.getId());
        if (documento.getIgreja() != null) {
            dto.setIgrejaId(documento.getIgreja().getId());
        }
        dto.setNome(documento.getNome());
        dto.setDescricao(documento.getDescricao());
        dto.setCategoria(documento.getCategoria());
        dto.setNomeArquivoOriginal(documento.getNomeArquivoOriginal());
        dto.setTipoArquivo(documento.getTipoArquivo());
        dto.setTamanhoArquivo(documento.getTamanhoArquivo());
        if (documento.getId() != null) {
            dto.setUrlDownload("/api/igreja/documentos/" + documento.getId() + "/download");
        }
        dto.setDataDocumento(documento.getDataDocumento());
        dto.setDataValidade(documento.getDataValidade());
        dto.setDataUpload(documento.getDataUpload());
        dto.setDataAtualizacao(documento.getDataAtualizacao());
        if (documento.getUsuarioUpload() != null) {
            dto.setUsuarioUploadId(documento.getUsuarioUpload().getId());
            dto.setUsuarioUploadNome(montarNomeUsuario(documento.getUsuarioUpload()));
        }
        dto.setAtivo(documento.getAtivo());
        return dto;
    }

    private String montarNomeUsuario(User user) {
        String primeiro = user.getFirstName() != null ? user.getFirstName().trim() : "";
        String ultimo = user.getLastName() != null ? user.getLastName().trim() : "";
        String nome = (primeiro + " " + ultimo).trim();
        if (!nome.isBlank()) {
            return nome;
        }
        return user.getLogin() != null ? user.getLogin() : "Usuário";
    }
}
