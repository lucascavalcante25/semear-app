package br.com.semear.service;

import br.com.semear.domain.ArtistaLouvor;
import br.com.semear.domain.Igreja;
import br.com.semear.repository.ArtistaLouvorRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ArtistaLouvorService {

    private static final Logger log = LoggerFactory.getLogger(ArtistaLouvorService.class);

    private final ArtistaLouvorRepository artistaLouvorRepository;
    private final TenantService tenantService;

    public ArtistaLouvorService(ArtistaLouvorRepository artistaLouvorRepository, TenantService tenantService) {
        this.artistaLouvorRepository = artistaLouvorRepository;
        this.tenantService = tenantService;
    }

    @Transactional(readOnly = true)
    public List<String> listarNomes(String query) {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        List<ArtistaLouvor> artistas;
        if (query == null || query.isBlank()) {
            artistas = artistaLouvorRepository.findByIgrejaIdOrderByNomeAsc(igrejaId);
        } else {
            artistas = artistaLouvorRepository.searchByIgrejaAndNome(igrejaId, query.trim());
        }
        return artistas.stream().map(ArtistaLouvor::getNome).toList();
    }

    public void registrarSeNecessario(Igreja igreja, String nome) {
        if (igreja == null || igreja.getId() == null || nome == null || nome.isBlank()) {
            return;
        }
        String trimmed = nome.trim();
        if (artistaLouvorRepository.findByIgrejaIdAndNomeIgnoreCase(igreja.getId(), trimmed).isPresent()) {
            return;
        }
        ArtistaLouvor artista = new ArtistaLouvor();
        artista.setIgreja(igreja);
        artista.setNome(trimmed);
        artistaLouvorRepository.save(artista);
        log.debug("Artista de louvor cadastrado: {} (igreja {})", trimmed, igreja.getId());
    }
}
