package br.com.semear.service.impl;

import br.com.semear.domain.Louvor;
import br.com.semear.repository.LouvorRepository;
import br.com.semear.service.ArtistaLouvorService;
import br.com.semear.service.LouvorService;
import br.com.semear.service.TenantService;
import br.com.semear.service.dto.LouvorDTO;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class LouvorServiceImpl implements LouvorService {

    private static final Logger log = LoggerFactory.getLogger(LouvorServiceImpl.class);
    private static final String[] ALLOWED_CONTENT_TYPES = {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword"
    };

    private final LouvorRepository louvorRepository;
    private final TenantService tenantService;
    private final ArtistaLouvorService artistaLouvorService;

    @Value("${semear.upload-dir:${user.home}/semear-app/uploads}")
    private String uploadDir;

    public LouvorServiceImpl(
        LouvorRepository louvorRepository,
        TenantService tenantService,
        ArtistaLouvorService artistaLouvorService
    ) {
        this.louvorRepository = louvorRepository;
        this.tenantService = tenantService;
        this.artistaLouvorService = artistaLouvorService;
    }

    private static LouvorDTO toDto(Louvor louvor) {
        if (louvor == null) return null;
        LouvorDTO dto = new LouvorDTO();
        dto.setId(louvor.getId());
        dto.setTitulo(louvor.getTitulo());
        dto.setArtista(louvor.getArtista());
        dto.setTonalidade(louvor.getTonalidade());
        dto.setTempo(louvor.getTempo());
        dto.setTipo(louvor.getTipo());
        dto.setYoutubeUrl(louvor.getYoutubeUrl());
        dto.setCifraUrl(louvor.getCifraUrl());
        dto.setCifraConteudo(louvor.getCifraConteudo());
        dto.setCifraFileName(louvor.getCifraFileName());
        dto.setCifraContentType(louvor.getCifraContentType());
        dto.setObservacoes(louvor.getObservacoes());
        dto.setAtivo(louvor.getAtivo());
        dto.setTemLetraSalva(louvor.getLetraConteudo() != null && !louvor.getLetraConteudo().isBlank());
        dto.setTemCifraApiSalva(louvor.getCifraApiCacheEm() != null);
        dto.setCreatedAt(louvor.getCreatedAt());
        dto.setUpdatedAt(louvor.getUpdatedAt());
        return dto;
    }

    private static Louvor toEntity(LouvorDTO dto) {
        if (dto == null) return null;
        Louvor louvor = new Louvor();
        louvor.setId(dto.getId());
        louvor.setTitulo(dto.getTitulo());
        louvor.setArtista(dto.getArtista());
        louvor.setTonalidade(dto.getTonalidade());
        louvor.setTempo(dto.getTempo());
        louvor.setTipo(dto.getTipo());
        louvor.setYoutubeUrl(dto.getYoutubeUrl());
        louvor.setCifraUrl(dto.getCifraUrl());
        louvor.setCifraConteudo(dto.getCifraConteudo());
        louvor.setCifraFileName(dto.getCifraFileName());
        louvor.setCifraContentType(dto.getCifraContentType());
        louvor.setObservacoes(dto.getObservacoes());
        louvor.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : true);
        louvor.setCreatedAt(dto.getCreatedAt());
        louvor.setUpdatedAt(dto.getUpdatedAt());
        return louvor;
    }

    @Override
    public LouvorDTO save(LouvorDTO dto) {
        log.debug("Request to save Louvor : {}", dto);
        Louvor louvor = toEntity(dto);
        if (dto.getId() != null) {
            Louvor existente = louvorRepository.findById(dto.getId()).orElseThrow(
                () -> new IllegalArgumentException("Louvor não encontrado: " + dto.getId())
            );
            tenantService.validarMesmaIgreja(existente.getIgreja());
            louvor.setIgreja(existente.getIgreja());
            louvor.setCreatedAt(existente.getCreatedAt());
            louvor.setCifraFileName(existente.getCifraFileName());
            louvor.setCifraContentType(existente.getCifraContentType());

            boolean artistaOuTituloMudou =
                !Objects.equals(normalizarTexto(existente.getArtista()), normalizarTexto(dto.getArtista())) ||
                !Objects.equals(normalizarTexto(existente.getTitulo()), normalizarTexto(dto.getTitulo()));
            boolean cifraUrlMudou = !Objects.equals(
                normalizarTexto(existente.getCifraUrl()),
                normalizarTexto(dto.getCifraUrl())
            );

            if (artistaOuTituloMudou) {
                louvor.setLetraConteudo(null);
                louvor.setLetraCacheEm(null);
                louvor.setCifraConteudo(null);
                louvor.setCifraApiCacheEm(null);
            } else {
                louvor.setLetraConteudo(existente.getLetraConteudo());
                louvor.setLetraCacheEm(existente.getLetraCacheEm());
                if (cifraUrlMudou) {
                    louvor.setCifraConteudo(null);
                    louvor.setCifraApiCacheEm(null);
                } else {
                    louvor.setCifraConteudo(existente.getCifraConteudo());
                    louvor.setCifraApiCacheEm(existente.getCifraApiCacheEm());
                }
            }
        } else if (louvor.getIgreja() == null) {
            louvor.setIgreja(tenantService.resolverIgrejaParaCriacao());
        }
        louvor = louvorRepository.save(louvor);
        artistaLouvorService.registrarSeNecessario(louvor.getIgreja(), louvor.getArtista());
        return toDto(louvor);
    }

    private static String normalizarTexto(String valor) {
        return valor == null ? null : valor.trim();
    }

    @Override
    public LouvorDTO saveWithCifra(LouvorDTO dto, MultipartFile cifraFile) {
        LouvorDTO saved = save(dto);
        if (cifraFile != null && !cifraFile.isEmpty()) {
            return updateCifra(saved.getId(), cifraFile);
        }
        return saved;
    }

    @Override
    public LouvorDTO updateCifra(Long id, MultipartFile cifraFile) {
        Louvor louvor = louvorRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Louvor não encontrado: " + id));

        if (cifraFile == null || cifraFile.isEmpty()) {
            return toDto(louvor);
        }

        String contentType = cifraFile.getContentType();
        if (contentType == null || !isAllowedContentType(contentType)) {
            throw new IllegalArgumentException("Tipo de arquivo não permitido. Use PDF ou Word.");
        }

        String originalName = cifraFile.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            originalName = "cifra";
        }
        String ext = getExtension(originalName);
        String storedName = "louvor_" + id + "_" + UUID.randomUUID().toString().substring(0, 8) + ext;

        Path basePath = Paths.get(uploadDir, "louvores").toAbsolutePath().normalize();
        try {
            Files.createDirectories(basePath);
            Path targetPath = basePath.resolve(storedName);

            if (louvor.getCifraFileName() != null) {
                Path oldPath = basePath.resolve(louvor.getCifraFileName());
                if (Files.exists(oldPath)) {
                    Files.delete(oldPath);
                }
            }

            cifraFile.transferTo(targetPath.toFile());

            louvor.setCifraFileName(storedName);
            louvor.setCifraContentType(contentType);
            louvor = louvorRepository.save(louvor);
        } catch (IOException e) {
            log.error("Erro ao salvar cifra do louvor {}", id, e);
            throw new RuntimeException("Erro ao salvar arquivo da cifra: " + e.getMessage());
        }

        return toDto(louvor);
    }

    @Override
    public LouvorDTO atualizarTonalidade(Long id, String tonalidade) {
        Louvor louvor = louvorRepository.findById(id).orElseThrow(
            () -> new IllegalArgumentException("Louvor não encontrado: " + id)
        );
        tenantService.validarMesmaIgreja(louvor.getIgreja());
        louvor.setTonalidade(tonalidade != null && !tonalidade.isBlank() ? tonalidade.trim() : null);
        louvor = louvorRepository.save(louvor);
        return toDto(louvor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LouvorDTO> findAll() {
        return louvorRepository.findAllByIgrejaIdOrderByTituloAsc(tenantService.getIgrejaIdAtual()).stream()
            .map(LouvorServiceImpl::toDto)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LouvorDTO> search(String query) {
        if (query == null || query.isBlank()) {
            return findAll();
        }
        return louvorRepository.searchByIgrejaAndTituloOrArtista(tenantService.getIgrejaIdAtual(), query.trim()).stream()
            .map(LouvorServiceImpl::toDto)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<LouvorDTO> findOne(Long id) {
        return louvorRepository.findById(id).map(l -> {
            tenantService.validarMesmaIgreja(l.getIgreja());
            return toDto(l);
        });
    }

    @Override
    public void delete(Long id) {
        Louvor louvor = louvorRepository.findById(id).orElse(null);
        if (louvor != null && louvor.getCifraFileName() != null) {
            Path targetPath = Paths.get(uploadDir, "louvores", louvor.getCifraFileName()).toAbsolutePath().normalize();
            try {
                if (Files.exists(targetPath)) {
                    Files.delete(targetPath);
                }
            } catch (IOException e) {
                log.warn("Não foi possível remover arquivo da cifra: {}", targetPath, e);
            }
        }
        louvorRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<byte[]> getCifraBytes(Long id) {
        return louvorRepository.findById(id)
            .filter(l -> l.getCifraFileName() != null)
            .flatMap(louvor -> {
                Path targetPath = Paths.get(uploadDir, "louvores", louvor.getCifraFileName()).toAbsolutePath().normalize();
                try {
                    if (Files.exists(targetPath)) {
                        return Optional.of(Files.readAllBytes(targetPath));
                    }
                } catch (IOException e) {
                    log.error("Erro ao ler cifra do louvor {}", id, e);
                }
                return Optional.empty();
            });
    }

    private boolean isAllowedContentType(String contentType) {
        for (String allowed : ALLOWED_CONTENT_TYPES) {
            if (contentType.startsWith(allowed) || contentType.equals(allowed)) {
                return true;
            }
        }
        return false;
    }

    private String getExtension(String filename) {
        int i = filename.lastIndexOf('.');
        if (i > 0) {
            return filename.substring(i);
        }
        return ".pdf";
    }
}
