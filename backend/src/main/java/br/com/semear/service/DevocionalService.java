package br.com.semear.service;

import br.com.semear.service.dto.DevocionalDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface DevocionalService {

    DevocionalDTO save(DevocionalDTO devocionalDTO);

    Page<DevocionalDTO> findAll(Pageable pageable);

    Optional<DevocionalDTO> findOne(Long id);

    void delete(Long id);
}
