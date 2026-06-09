package br.com.semear.service.mapper;

import br.com.semear.domain.Igreja;
import br.com.semear.service.dto.IgrejaDTO;
import br.com.semear.service.dto.IgrejaPixDTO;
import br.com.semear.service.dto.IgrejaPublicaDTO;
import org.springframework.stereotype.Service;

@Service
public class IgrejaMapper {

    public IgrejaDTO toDto(Igreja igreja) {
        if (igreja == null) {
            return null;
        }
        IgrejaDTO dto = new IgrejaDTO();
        dto.setId(igreja.getId());
        dto.setNome(igreja.getNome());
        dto.setNomeFantasia(igreja.getNomeFantasia());
        dto.setCnpj(igreja.getCnpj());
        dto.setEmail(igreja.getEmail());
        dto.setTelefone(igreja.getTelefone());
        dto.setCep(igreja.getCep());
        dto.setEndereco(igreja.getEndereco());
        dto.setNumero(igreja.getNumero());
        dto.setBairro(igreja.getBairro());
        dto.setCidade(igreja.getCidade());
        dto.setEstado(igreja.getEstado());
        dto.setComplemento(igreja.getComplemento());
        dto.setNomePastorResponsavel(igreja.getNomePastorResponsavel());
        dto.setCpfPastorResponsavel(igreja.getCpfPastorResponsavel());
        dto.setTelefoneResponsavel(igreja.getTelefoneResponsavel());
        dto.setEmailResponsavel(igreja.getEmailResponsavel());
        dto.setChavePix(igreja.getChavePix());
        dto.setTipoChavePix(igreja.getTipoChavePix());
        dto.setNomeTitularPix(igreja.getNomeTitularPix());
        dto.setBancoPix(igreja.getBancoPix());
        dto.setDocumentoTitularPix(igreja.getDocumentoTitularPix());
        dto.setLogoUrl(igreja.getLogoUrl());
        dto.setCorPrimaria(igreja.getCorPrimaria());
        dto.setCorSecundaria(igreja.getCorSecundaria());
        dto.setTemaPreferido(igreja.getTemaPreferido());
        dto.setTextoBoasVindas(igreja.getTextoBoasVindas());
        dto.setDescricaoIgreja(igreja.getDescricaoIgreja());
        dto.setTextoAgradecimentoOferta(igreja.getTextoAgradecimentoOferta());
        dto.setStatus(igreja.getStatus());
        dto.setDataCadastro(igreja.getDataCadastro());
        dto.setDataAtualizacao(igreja.getDataAtualizacao());
        return dto;
    }

    public Igreja toEntity(IgrejaDTO dto) {
        if (dto == null) {
            return null;
        }
        Igreja igreja = new Igreja();
        igreja.setId(dto.getId());
        igreja.setNome(dto.getNome());
        igreja.setNomeFantasia(dto.getNomeFantasia());
        igreja.setCnpj(dto.getCnpj());
        igreja.setEmail(dto.getEmail());
        igreja.setTelefone(dto.getTelefone());
        igreja.setCep(dto.getCep());
        igreja.setEndereco(dto.getEndereco());
        igreja.setNumero(dto.getNumero());
        igreja.setBairro(dto.getBairro());
        igreja.setCidade(dto.getCidade());
        igreja.setEstado(dto.getEstado());
        igreja.setComplemento(dto.getComplemento());
        igreja.setNomePastorResponsavel(dto.getNomePastorResponsavel());
        igreja.setCpfPastorResponsavel(dto.getCpfPastorResponsavel());
        igreja.setTelefoneResponsavel(dto.getTelefoneResponsavel());
        igreja.setEmailResponsavel(dto.getEmailResponsavel());
        igreja.setChavePix(dto.getChavePix());
        igreja.setTipoChavePix(dto.getTipoChavePix());
        igreja.setNomeTitularPix(dto.getNomeTitularPix());
        igreja.setBancoPix(dto.getBancoPix());
        igreja.setDocumentoTitularPix(dto.getDocumentoTitularPix());
        igreja.setLogoUrl(dto.getLogoUrl());
        igreja.setCorPrimaria(dto.getCorPrimaria());
        igreja.setCorSecundaria(dto.getCorSecundaria());
        igreja.setTemaPreferido(dto.getTemaPreferido());
        igreja.setTextoBoasVindas(dto.getTextoBoasVindas());
        igreja.setDescricaoIgreja(dto.getDescricaoIgreja());
        igreja.setTextoAgradecimentoOferta(dto.getTextoAgradecimentoOferta());
        igreja.setStatus(dto.getStatus());
        igreja.setDataCadastro(dto.getDataCadastro());
        igreja.setDataAtualizacao(dto.getDataAtualizacao());
        return igreja;
    }

    public IgrejaPublicaDTO toPublicaDto(Igreja igreja) {
        if (igreja == null) {
            return null;
        }
        IgrejaPublicaDTO dto = new IgrejaPublicaDTO();
        dto.setId(igreja.getId());
        dto.setNome(igreja.getNome());
        dto.setNomeFantasia(igreja.getNomeFantasia());
        dto.setLogoUrl(igreja.getLogoUrl());
        dto.setCorPrimaria(igreja.getCorPrimaria());
        dto.setCorSecundaria(igreja.getCorSecundaria());
        dto.setTemaPreferido(igreja.getTemaPreferido());
        dto.setTextoBoasVindas(igreja.getTextoBoasVindas());
        dto.setDescricaoIgreja(igreja.getDescricaoIgreja());
        dto.setCidade(igreja.getCidade());
        dto.setEstado(igreja.getEstado());
        return dto;
    }

    public IgrejaPixDTO toPixDto(Igreja igreja) {
        if (igreja == null) {
            return null;
        }
        IgrejaPixDTO dto = new IgrejaPixDTO();
        dto.setNome(igreja.getNome());
        dto.setNomeFantasia(igreja.getNomeFantasia());
        dto.setCnpj(igreja.getCnpj());
        dto.setLogoUrl(igreja.getLogoUrl());
        dto.setChavePix(igreja.getChavePix());
        dto.setTipoChavePix(igreja.getTipoChavePix());
        dto.setNomeTitularPix(igreja.getNomeTitularPix());
        dto.setBancoPix(igreja.getBancoPix());
        dto.setDocumentoTitularPix(igreja.getDocumentoTitularPix());
        dto.setTextoAgradecimentoOferta(igreja.getTextoAgradecimentoOferta());
        dto.setCidade(igreja.getCidade());
        return dto;
    }

    public Igreja fromId(Long id) {
        if (id == null) {
            return null;
        }
        Igreja igreja = new Igreja();
        igreja.setId(id);
        return igreja;
    }
}
