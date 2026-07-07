package br.com.semear.service.impl;

import br.com.semear.domain.Louvor;
import br.com.semear.repository.LouvorRepository;
import br.com.semear.repository.projection.LouvorListagemProjection;
import br.com.semear.service.ArtistaLouvorService;
import br.com.semear.service.LouvorService;
import br.com.semear.service.TenantService;
import br.com.semear.service.dto.LouvorDTO;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class LouvorServiceImpl implements LouvorService {

    private static final Logger log = LoggerFactory.getLogger(LouvorServiceImpl.class);

    private final LouvorRepository louvorRepository;
    private final TenantService tenantService;
    private final ArtistaLouvorService artistaLouvorService;

    public LouvorServiceImpl(
        LouvorRepository louvorRepository,
        TenantService tenantService,
        ArtistaLouvorService artistaLouvorService
    ) {
        this.louvorRepository = louvorRepository;
        this.tenantService = tenantService;
        this.artistaLouvorService = artistaLouvorService;
    }

    private static LouvorDTO fromListagem(LouvorListagemProjection p) {
        if (p == null) return null;
        LouvorDTO dto = new LouvorDTO();
        dto.setId(p.getId());
        dto.setTitulo(p.getTitulo());
        dto.setArtista(p.getArtista());
        dto.setTonalidade(p.getTonalidade());
        dto.setTempo(p.getTempo());
        dto.setTipo(p.getTipo());
        dto.setYoutubeUrl(p.getYoutubeUrl());
        dto.setAtivo(p.getAtivo());
        dto.setTemLetraSalva(p.getTemLetraSalva());
        dto.setTemCifraApiSalva(p.getTemCifraApiSalva());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
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

            boolean artistaOuTituloMudou =
                !Objects.equals(normalizarTexto(existente.getArtista()), normalizarTexto(dto.getArtista())) ||
                !Objects.equals(normalizarTexto(existente.getTitulo()), normalizarTexto(dto.getTitulo()));

            if (artistaOuTituloMudou) {
                // Título/artista mudaram: cache de letra e cifra online deixam de valer.
                louvor.setLetraConteudo(null);
                louvor.setLetraCacheEm(null);
                louvor.setCifraConteudo(null);
                louvor.setCifraApiCacheEm(null);
            } else {
                louvor.setLetraConteudo(existente.getLetraConteudo());
                louvor.setLetraCacheEm(existente.getLetraCacheEm());
                louvor.setCifraConteudo(existente.getCifraConteudo());
                louvor.setCifraApiCacheEm(existente.getCifraApiCacheEm());
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
        return louvorRepository
            .findResumoByIgrejaIdOrderByTituloAsc(tenantService.getIgrejaIdAtual())
            .stream()
            .map(LouvorServiceImpl::fromListagem)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LouvorDTO> search(String query) {
        if (query == null || query.isBlank()) {
            return findAll();
        }
        return louvorRepository
            .searchResumoByIgrejaAndTituloOrArtista(tenantService.getIgrejaIdAtual(), query.trim())
            .stream()
            .map(LouvorServiceImpl::fromListagem)
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
        louvorRepository.deleteById(id);
    }
}
