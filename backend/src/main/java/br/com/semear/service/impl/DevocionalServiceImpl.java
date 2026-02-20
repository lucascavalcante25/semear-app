package br.com.semear.service.impl;

import br.com.semear.domain.Devocional;
import br.com.semear.repository.DevocionalRepository;
import br.com.semear.service.DevocionalService;
import br.com.semear.service.dto.DevocionalDTO;
import br.com.semear.service.mapper.DevocionalMapper;
import java.time.LocalDate;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DevocionalServiceImpl implements DevocionalService {

    private final Logger log = LoggerFactory.getLogger(DevocionalServiceImpl.class);

    private final DevocionalRepository devocionalRepository;

    private final DevocionalMapper devocionalMapper;

    public DevocionalServiceImpl(DevocionalRepository devocionalRepository, DevocionalMapper devocionalMapper) {
        this.devocionalRepository = devocionalRepository;
        this.devocionalMapper = devocionalMapper;
    }

    @Override
    public DevocionalDTO save(DevocionalDTO devocionalDTO) {
        log.debug("Request to save Devocional : {}", devocionalDTO);
        Devocional dev = devocionalMapper.toEntity(devocionalDTO);
        dev = devocionalRepository.save(dev);
        return devocionalMapper.toDto(dev);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DevocionalDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Devocionais");
        return devocionalRepository.findAllByOrderByDataPublicacaoDesc(pageable).map(devocionalMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<DevocionalDTO> findOne(Long id) {
        log.debug("Request to get Devocional : {}", id);
        return devocionalRepository.findById(id).map(devocionalMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<DevocionalDTO> findHoje(LocalDate hoje) {
        log.debug("Request to get Devocional do dia : {}", hoje);
        return devocionalRepository.findFirstByDataPublicacaoOrderByIdDesc(hoje).map(devocionalMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DevocionalDTO> findPassados(LocalDate hoje, Pageable pageable) {
        log.debug("Request to get Devocionais passados before : {}", hoje);
        return devocionalRepository.findByDataPublicacaoBeforeOrderByDataPublicacaoDesc(hoje, pageable).map(devocionalMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        log.debug("Request to delete Devocional : {}", id);
        devocionalRepository.deleteById(id);
    }
}
