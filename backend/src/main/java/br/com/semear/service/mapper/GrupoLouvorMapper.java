package br.com.semear.service.mapper;

import br.com.semear.domain.GrupoLouvor;
import br.com.semear.domain.GrupoLouvorItem;
import br.com.semear.domain.Louvor;
import br.com.semear.service.dto.GrupoLouvorDTO;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class GrupoLouvorMapper {

    private final LouvorMapper louvorMapper;

    public GrupoLouvorMapper(LouvorMapper louvorMapper) {
        this.louvorMapper = louvorMapper;
    }

    public GrupoLouvorDTO toDto(GrupoLouvor grupo) {
        if (grupo == null) return null;
        GrupoLouvorDTO dto = new GrupoLouvorDTO();
        dto.setId(grupo.getId());
        dto.setNome(grupo.getNome());
        dto.setOrdem(grupo.getOrdem() != null ? grupo.getOrdem() : 0);
        List<Long> ids = new ArrayList<>();
        for (GrupoLouvorItem item : grupo.getItens()) {
            if (item.getLouvor() != null && item.getLouvor().getId() != null) {
                ids.add(item.getLouvor().getId());
            }
        }
        dto.setLouvorIds(ids);
        return dto;
    }

    public GrupoLouvor toEntity(GrupoLouvorDTO dto) {
        if (dto == null) return null;
        GrupoLouvor grupo = new GrupoLouvor();
        grupo.setId(dto.getId());
        grupo.setNome(dto.getNome());
        grupo.setOrdem(dto.getOrdem() != null ? dto.getOrdem() : 0);
        return grupo;
    }
}
