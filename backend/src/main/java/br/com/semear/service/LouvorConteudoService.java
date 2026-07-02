package br.com.semear.service;

import br.com.semear.domain.Louvor;
import br.com.semear.repository.LouvorRepository;
import br.com.semear.service.dto.LouvorCifraApiDTO;
import br.com.semear.service.dto.LouvorLetraDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LouvorConteudoService {

    private static final Logger log = LoggerFactory.getLogger(LouvorConteudoService.class);

    private final LouvorRepository louvorRepository;
    private final TenantService tenantService;
    private final VagalumeService vagalumeService;
    private final CifraClubService cifraClubService;
    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<Long, Object> locks = new ConcurrentHashMap<>();

    public LouvorConteudoService(
        LouvorRepository louvorRepository,
        TenantService tenantService,
        VagalumeService vagalumeService,
        CifraClubService cifraClubService,
        ObjectMapper objectMapper
    ) {
        this.louvorRepository = louvorRepository;
        this.tenantService = tenantService;
        this.vagalumeService = vagalumeService;
        this.cifraClubService = cifraClubService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public LouvorLetraDTO obterLetra(Long id) {
        Object lock = locks.computeIfAbsent(id, ignored -> new Object());
        synchronized (lock) {
            Louvor louvor = carregarLouvor(id);
            LouvorLetraDTO dto = new LouvorLetraDTO();
            dto.setFonte("vagalume");

            if (louvor.getLetraConteudo() != null && !louvor.getLetraConteudo().isBlank()) {
                dto.setDisponivel(true);
                dto.setTexto(louvor.getLetraConteudo());
                dto.setDoCache(true);
                dto.setCacheEm(louvor.getLetraCacheEm());
                return dto;
            }

            if (!vagalumeService.isConfigurado()) {
                dto.setDisponivel(false);
                dto.setMensagem("Integração com Vagalume não configurada. Defina SEMEAR_VAGALUME_API_KEY no servidor.");
                return dto;
            }

            Optional<String> letra = vagalumeService.buscarLetra(louvor.getArtista(), louvor.getTitulo());
            if (letra.isEmpty()) {
                dto.setDisponivel(false);
                dto.setMensagem("Letra não encontrada no Vagalume para este artista e título.");
                return dto;
            }

            Instant agora = Instant.now();
            louvor.setLetraConteudo(letra.get());
            louvor.setLetraCacheEm(agora);
            louvorRepository.save(louvor);

            dto.setDisponivel(true);
            dto.setTexto(letra.get());
            dto.setDoCache(false);
            dto.setCacheEm(agora);
            log.debug("Letra do louvor {} salva em cache", id);
            return dto;
        }
    }

    @Transactional
    public LouvorCifraApiDTO obterCifraApi(Long id) {
        Object lock = locks.computeIfAbsent(id, ignored -> new Object());
        synchronized (lock) {
            Louvor louvor = carregarLouvor(id);
            LouvorCifraApiDTO dto = new LouvorCifraApiDTO();
            dto.setFonte("cifraclub");

            Optional<CifraCache> cache = lerCacheCifra(louvor.getCifraConteudo());
            if (cache.isPresent()) {
                dto.setDisponivel(true);
                dto.setLinhas(cache.get().linhas());
                dto.setUrl(cache.get().url());
                dto.setDoCache(true);
                dto.setCacheEm(louvor.getCifraApiCacheEm());
                return dto;
            }

            Optional<CifraClubService.ResultadoCifra> resultado = cifraClubService.buscarCifra(
                louvor.getArtista(),
                louvor.getTitulo(),
                louvor.getCifraUrl()
            );

            if (resultado.isEmpty()) {
                dto.setDisponivel(false);
                dto.setMensagem(
                    "Cifra não encontrada. Informe o link do Cifra Club no cadastro ou verifique artista/título."
                );
                return dto;
            }

            Instant agora = Instant.now();
            salvarCacheCifra(louvor, resultado.get().url(), resultado.get().linhas(), agora);

            dto.setDisponivel(true);
            dto.setLinhas(resultado.get().linhas());
            dto.setUrl(resultado.get().url());
            dto.setDoCache(false);
            dto.setCacheEm(agora);
            log.debug("Cifra API do louvor {} salva em cache", id);
            return dto;
        }
    }

    private Louvor carregarLouvor(Long id) {
        Louvor louvor = louvorRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Louvor não encontrado: " + id));
        tenantService.validarMesmaIgreja(louvor.getIgreja());
        return louvor;
    }

    private void salvarCacheCifra(Louvor louvor, String url, List<String> linhas, Instant agora) {
        try {
            String json = objectMapper.writeValueAsString(Map.of("url", url, "linhas", linhas));
            louvor.setCifraConteudo(json);
            louvor.setCifraApiCacheEm(agora);
            louvorRepository.save(louvor);
        } catch (Exception e) {
            throw new IllegalStateException("Erro ao salvar cache da cifra", e);
        }
    }

    private Optional<CifraCache> lerCacheCifra(String conteudo) {
        if (conteudo == null || conteudo.isBlank()) {
            return Optional.empty();
        }
        try {
            if (conteudo.trim().startsWith("[")) {
                List<String> linhas = objectMapper.readValue(conteudo, new TypeReference<>() {});
                return Optional.of(new CifraCache(null, linhas));
            }
            Map<String, Object> map = objectMapper.readValue(conteudo, new TypeReference<>() {});
            Object linhasObj = map.get("linhas");
            if (!(linhasObj instanceof List<?> lista) || lista.isEmpty()) {
                return Optional.empty();
            }
            List<String> linhas = lista.stream().map(String::valueOf).toList();
            String url = map.get("url") != null ? String.valueOf(map.get("url")) : null;
            return Optional.of(new CifraCache(url, linhas));
        } catch (Exception e) {
            log.debug("Conteúdo de cifra não é cache JSON válido: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private record CifraCache(String url, List<String> linhas) {}
}
