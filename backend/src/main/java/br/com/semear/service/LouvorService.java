package br.com.semear.service;

import br.com.semear.service.dto.LouvorDTO;
import java.util.List;
import java.util.Optional;

public interface LouvorService {

    LouvorDTO save(LouvorDTO dto);

    LouvorDTO atualizarTonalidade(Long id, String tonalidade);

    List<LouvorDTO> findAll();

    List<LouvorDTO> search(String query);

    Optional<LouvorDTO> findOne(Long id);

    void delete(Long id);
}
