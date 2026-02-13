package br.com.semear.service.mapper;

import br.com.semear.domain.Devocional;
import br.com.semear.service.dto.DevocionalDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DevocionalMapper {

    DevocionalDTO toDto(Devocional devocional);

    Devocional toEntity(DevocionalDTO dto);

    default Devocional fromId(Long id) {
        if (id == null) {
            return null;
        }
        Devocional devocional = new Devocional();
        devocional.setId(id);
        return devocional;
    }
}
