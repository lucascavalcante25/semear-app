package br.com.semear.service;

import br.com.semear.service.dto.LouvorDTO;
import java.util.List;
import java.util.Optional;
import org.springframework.web.multipart.MultipartFile;

public interface LouvorService {

    LouvorDTO save(LouvorDTO dto);

    LouvorDTO saveWithCifra(LouvorDTO dto, MultipartFile cifraFile);

    LouvorDTO updateCifra(Long id, MultipartFile cifraFile);

    List<LouvorDTO> findAll();

    List<LouvorDTO> search(String query);

    Optional<LouvorDTO> findOne(Long id);

    void delete(Long id);

    Optional<byte[]> getCifraBytes(Long id);
}
