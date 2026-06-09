package br.com.semear.service.mapper;

import br.com.semear.domain.Igreja;
import br.com.semear.service.dto.IgrejaDTO;
import br.com.semear.service.dto.IgrejaPixDTO;
import br.com.semear.service.dto.IgrejaPublicaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "default")
public interface IgrejaMapper {

    IgrejaDTO toDto(Igreja igreja);

    Igreja toEntity(IgrejaDTO dto);

    IgrejaPublicaDTO toPublicaDto(Igreja igreja);

    @Mapping(target = "nome", source = "nome")
    IgrejaPixDTO toPixDto(Igreja igreja);

    default Igreja fromId(Long id) {
        if (id == null) {
            return null;
        }
        Igreja igreja = new Igreja();
        igreja.setId(id);
        return igreja;
    }
}
