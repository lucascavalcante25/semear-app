package br.com.semear.service;

import br.com.semear.service.dto.GrupoLouvorDTO;
import java.util.List;

public interface GrupoLouvorService {

    GrupoLouvorDTO save(GrupoLouvorDTO dto);

    GrupoLouvorDTO update(GrupoLouvorDTO dto);

    List<GrupoLouvorDTO> findAll();

    java.util.Optional<GrupoLouvorDTO> findOne(Long id);

    void delete(Long id);

    GrupoLouvorDTO addLouvor(Long grupoId, Long louvorId);

    void removeLouvor(Long grupoId, Long louvorId);

    GrupoLouvorDTO reorderLouvores(Long grupoId, List<Long> louvorIdsInOrder);
}
