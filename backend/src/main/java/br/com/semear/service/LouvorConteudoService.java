package br.com.semear.service;

import br.com.semear.domain.Louvor;
import br.com.semear.repository.LouvorRepository;
import br.com.semear.service.dto.LouvorCifraApiDTO;
import br.com.semear.service.dto.LouvorLetraDTO;
import br.com.semear.service.util.LouvorLetraUtils;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.ArrayList;
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
    private final LetraLouvorService letraLouvorService;
    private final CifraClubService cifraClubService;
    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<Long, Object> locks = new ConcurrentHashMap<>();

    public LouvorConteudoService(
        LouvorRepository louvorRepository,
        TenantService tenantService,
        LetraLouvorService letraLouvorService,
        CifraClubService cifraClubService,
        ObjectMapper objectMapper
    ) {
        this.louvorRepository = louvorRepository;
        this.tenantService = tenantService;
        this.letraLouvorService = letraLouvorService;
        this.cifraClubService = cifraClubService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public LouvorLetraDTO obterLetra(Long id) {
        Object lock = locks.computeIfAbsent(id, ignored -> new Object());
        synchronized (lock) {
            Louvor louvor = carregarLouvor(id);
            LouvorLetraDTO dto = new LouvorLetraDTO();

            Optional<LetraCache> cache = lerLetraSalva(louvor.getLetraConteudo());
            if (cache.isPresent() && !LouvorLetraUtils.pareceCifra(cache.get().texto())) {
                dto.setDisponivel(true);
                dto.setTexto(cache.get().texto());
                dto.setFonte(cache.get().fonte());
                dto.setDoCache(true);
                dto.setCacheEm(louvor.getLetraCacheEm());
                return dto;
            }
            if (cache.isPresent() && LouvorLetraUtils.pareceCifra(cache.get().texto())) {
                log.debug("Cache de letra do louvor {} parece cifra; buscando novamente", id);
            }

            Optional<LetraLouvorService.ResultadoLetra> letra = letraLouvorService.buscarLetra(
                louvor.getArtista(),
                louvor.getTitulo(),
                louvor.getCifraUrl()
            );
            if (letra.isEmpty()) {
                dto.setDisponivel(false);
                dto.setMensagem(
                    "Letra não encontrada. Você pode inserir manualmente ou informar o link do Cifra Club no cadastro."
                );
                return dto;
            }

            if (LouvorLetraUtils.pareceCifra(letra.get().texto())) {
                dto.setDisponivel(false);
                dto.setMensagem(
                    "Letra não encontrada automaticamente. Use inserir manualmente para colar só a letra."
                );
                return dto;
            }

            Instant agora = Instant.now();
            salvarLetraCache(louvor, letra.get().texto(), letra.get().fonte(), agora);

            dto.setDisponivel(true);
            dto.setTexto(letra.get().texto());
            dto.setFonte(letra.get().fonte());
            dto.setDoCache(false);
            dto.setCacheEm(agora);
            log.debug("Letra do louvor {} salva em cache (fonte: {})", id, letra.get().fonte());
            return dto;
        }
    }

    @Transactional
    public LouvorLetraDTO salvarLetraManual(Long id, String texto) {
        Object lock = locks.computeIfAbsent(id, ignored -> new Object());
        synchronized (lock) {
            if (texto == null || texto.isBlank()) {
                throw new IllegalArgumentException("Informe o texto da letra.");
            }

            Louvor louvor = carregarLouvor(id);
            Instant agora = Instant.now();
            salvarLetraCache(louvor, texto.trim(), "manual", agora);

            LouvorLetraDTO dto = new LouvorLetraDTO();
            dto.setDisponivel(true);
            dto.setTexto(texto.trim());
            dto.setFonte("manual");
            dto.setDoCache(true);
            dto.setCacheEm(agora);
            return dto;
        }
    }

    @Transactional
    public LouvorCifraApiDTO obterCifraApi(Long id) {
        Object lock = locks.computeIfAbsent(id, ignored -> new Object());
        synchronized (lock) {
            Louvor louvor = carregarLouvor(id);
            LouvorCifraApiDTO dto = new LouvorCifraApiDTO();

            Optional<CifraCache> cache = lerCacheCifra(louvor.getCifraConteudo());
            if (cache.isPresent()) {
                dto.setDisponivel(true);
                dto.setLinhas(cache.get().linhas());
                dto.setUrl(cache.get().url());
                dto.setFonte(cache.get().fonte());
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
                    "Cifra não encontrada. Você pode inserir manualmente ou informar o link do Cifra Club no cadastro."
                );
                return dto;
            }

            Instant agora = Instant.now();
            salvarCacheCifra(louvor, resultado.get().url(), resultado.get().linhas(), "cifraclub", agora);

            dto.setDisponivel(true);
            dto.setLinhas(resultado.get().linhas());
            dto.setUrl(resultado.get().url());
            dto.setFonte("cifraclub");
            dto.setDoCache(false);
            dto.setCacheEm(agora);
            log.debug("Cifra API do louvor {} salva em cache", id);
            return dto;
        }
    }

    @Transactional
    public LouvorCifraApiDTO salvarCifraManual(Long id, String texto) {
        Object lock = locks.computeIfAbsent(id, ignored -> new Object());
        synchronized (lock) {
            if (texto == null || texto.isBlank()) {
                throw new IllegalArgumentException("Informe o texto da cifra.");
            }

            List<String> linhas = textoParaLinhas(texto);
            if (linhas.isEmpty()) {
                throw new IllegalArgumentException("Informe o texto da cifra.");
            }

            Louvor louvor = carregarLouvor(id);
            Instant agora = Instant.now();
            salvarCacheCifra(louvor, null, linhas, "manual", agora);

            LouvorCifraApiDTO dto = new LouvorCifraApiDTO();
            dto.setDisponivel(true);
            dto.setLinhas(linhas);
            dto.setFonte("manual");
            dto.setDoCache(true);
            dto.setCacheEm(agora);
            return dto;
        }
    }

    private Louvor carregarLouvor(Long id) {
        Louvor louvor = louvorRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Louvor não encontrado: " + id));
        tenantService.validarMesmaIgreja(louvor.getIgreja());
        return louvor;
    }

    private void salvarLetraCache(Louvor louvor, String texto, String fonte, Instant agora) {
        try {
            String json = objectMapper.writeValueAsString(Map.of("texto", texto, "fonte", fonte));
            louvor.setLetraConteudo(json);
            louvor.setLetraCacheEm(agora);
            louvorRepository.save(louvor);
        } catch (Exception e) {
            throw new IllegalStateException("Erro ao salvar letra", e);
        }
    }

    private void salvarCacheCifra(Louvor louvor, String url, List<String> linhas, String fonte, Instant agora) {
        try {
            String json = objectMapper.writeValueAsString(Map.of("url", url != null ? url : "", "linhas", linhas, "fonte", fonte));
            louvor.setCifraConteudo(json);
            louvor.setCifraApiCacheEm(agora);
            louvorRepository.save(louvor);
        } catch (Exception e) {
            throw new IllegalStateException("Erro ao salvar cache da cifra", e);
        }
    }

    private Optional<LetraCache> lerLetraSalva(String conteudo) {
        if (conteudo == null || conteudo.isBlank()) {
            return Optional.empty();
        }
        String trimmed = conteudo.trim();
        if (trimmed.startsWith("{")) {
            try {
                Map<String, Object> map = objectMapper.readValue(trimmed, new TypeReference<>() {});
                Object textoObj = map.get("texto");
                if (textoObj == null || String.valueOf(textoObj).isBlank()) {
                    return Optional.empty();
                }
                String fonte = map.get("fonte") != null ? String.valueOf(map.get("fonte")) : "salva";
                return Optional.of(new LetraCache(String.valueOf(textoObj), fonte));
            } catch (Exception e) {
                log.debug("Conteúdo de letra JSON inválido: {}", e.getMessage());
                return Optional.empty();
            }
        }
        return Optional.of(new LetraCache(trimmed, "salva"));
    }

    private Optional<CifraCache> lerCacheCifra(String conteudo) {
        if (conteudo == null || conteudo.isBlank()) {
            return Optional.empty();
        }
        try {
            if (conteudo.trim().startsWith("[")) {
                List<String> linhas = objectMapper.readValue(conteudo, new TypeReference<>() {});
                if (linhas.isEmpty()) {
                    return Optional.empty();
                }
                return Optional.of(new CifraCache(null, linhas, "salva"));
            }
            Map<String, Object> map = objectMapper.readValue(conteudo, new TypeReference<>() {});
            Object linhasObj = map.get("linhas");
            if (!(linhasObj instanceof List<?> lista) || lista.isEmpty()) {
                return Optional.empty();
            }
            List<String> linhas = lista.stream().map(String::valueOf).toList();
            String url = map.get("url") != null ? String.valueOf(map.get("url")) : null;
            if (url != null && url.isBlank()) {
                url = null;
            }
            String fonte = map.get("fonte") != null ? String.valueOf(map.get("fonte")) : (url != null ? "cifraclub" : "salva");
            return Optional.of(new CifraCache(url, linhas, fonte));
        } catch (Exception e) {
            log.debug("Conteúdo de cifra não é cache JSON válido: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private List<String> textoParaLinhas(String texto) {
        String normalizado = texto.replace("\r\n", "\n").replace('\r', '\n');
        String[] partes = normalizado.split("\n", -1);
        List<String> linhas = new ArrayList<>(partes.length);
        for (String parte : partes) {
            linhas.add(parte.stripTrailing());
        }
        while (!linhas.isEmpty() && linhas.get(linhas.size() - 1).isBlank()) {
            linhas.remove(linhas.size() - 1);
        }
        return linhas;
    }

    private record LetraCache(String texto, String fonte) {}

    private record CifraCache(String url, List<String> linhas, String fonte) {}
}
