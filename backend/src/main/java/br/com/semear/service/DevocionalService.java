package br.com.semear.service;

import br.com.semear.service.dto.DevocionalDTO;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface DevocionalService {

    DevocionalDTO save(DevocionalDTO devocionalDTO);

    Page<DevocionalDTO> findAll(Pageable pageable);

    Optional<DevocionalDTO> findOne(Long id);

    Optional<DevocionalDTO> findHoje(LocalDate hoje);

    Page<DevocionalDTO> findPassados(LocalDate hoje, Pageable pageable);

    void delete(Long id);
}
