package br.com.semear.service.mapper;

import br.com.semear.domain.Louvor;
import br.com.semear.service.dto.LouvorDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LouvorMapper {

    LouvorDTO toDto(Louvor louvor);

    Louvor toEntity(LouvorDTO dto);

    default Louvor fromId(Long id) {
        if (id == null) return null;
        Louvor louvor = new Louvor();
        louvor.setId(id);
        return louvor;
    }
}
