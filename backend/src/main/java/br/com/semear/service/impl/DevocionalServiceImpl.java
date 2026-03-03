package br.com.semear.service.impl;

import br.com.semear.domain.Devocional;
import br.com.semear.repository.DevocionalRepository;
import br.com.semear.service.DevocionalService;
import br.com.semear.service.dto.DevocionalDTO;
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

    public DevocionalServiceImpl(DevocionalRepository devocionalRepository) {
        this.devocionalRepository = devocionalRepository;
    }

    private static DevocionalDTO toDto(Devocional devocional) {
        if (devocional == null) {
            return null;
        }
        DevocionalDTO dto = new DevocionalDTO();
        dto.setId(devocional.getId());
        dto.setTitulo(devocional.getTitulo());
        dto.setVersiculoBase(devocional.getVersiculoBase());
        dto.setTextoVersiculo(devocional.getTextoVersiculo());
        dto.setConteudo(devocional.getConteudo());
        dto.setDataPublicacao(devocional.getDataPublicacao());
        dto.setCreatedAt(devocional.getCreatedAt());
        dto.setUpdatedAt(devocional.getUpdatedAt());
        return dto;
    }

    private static Devocional toEntity(DevocionalDTO dto) {
        if (dto == null) {
            return null;
        }
        Devocional devocional = new Devocional();
        devocional.setId(dto.getId());
        devocional.setTitulo(dto.getTitulo());
        devocional.setVersiculoBase(dto.getVersiculoBase());
        devocional.setTextoVersiculo(dto.getTextoVersiculo());
        devocional.setConteudo(dto.getConteudo());
        devocional.setDataPublicacao(dto.getDataPublicacao());
        devocional.setCreatedAt(dto.getCreatedAt());
        devocional.setUpdatedAt(dto.getUpdatedAt());
        return devocional;
    }

    @Override
    public DevocionalDTO save(DevocionalDTO devocionalDTO) {
        log.debug("Request to save Devocional : {}", devocionalDTO);
        Devocional dev = toEntity(devocionalDTO);
        dev = devocionalRepository.save(dev);
        return toDto(dev);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DevocionalDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Devocionais");
        return devocionalRepository.findAllByOrderByDataPublicacaoDesc(pageable).map(DevocionalServiceImpl::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<DevocionalDTO> findOne(Long id) {
        log.debug("Request to get Devocional : {}", id);
        return devocionalRepository.findById(id).map(DevocionalServiceImpl::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<DevocionalDTO> findHoje(LocalDate hoje) {
        log.debug("Request to get Devocional do dia : {}", hoje);
        return devocionalRepository.findFirstByDataPublicacaoOrderByIdDesc(hoje).map(DevocionalServiceImpl::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DevocionalDTO> findPassados(LocalDate hoje, Pageable pageable) {
        log.debug("Request to get Devocionais passados before : {}", hoje);
        return devocionalRepository.findByDataPublicacaoBeforeOrderByDataPublicacaoDesc(hoje, pageable)
            .map(DevocionalServiceImpl::toDto);
    }

    @Override
    public void delete(Long id) {
        log.debug("Request to delete Devocional : {}", id);
        devocionalRepository.deleteById(id);
    }
}
