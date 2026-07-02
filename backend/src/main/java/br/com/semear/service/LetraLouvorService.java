package br.com.semear.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class LetraLouvorService {

    private static final Logger log = LoggerFactory.getLogger(LetraLouvorService.class);
    private static final String LRCLIB_BASE = "https://lrclib.net/api";
    private static final String GENIUS_BASE = "https://api.genius.com";
    private static final Pattern LINHA_TAB = Pattern.compile("^[EBGDA]\\|", Pattern.CASE_INSENSITIVE);

    private final RestClient lrclibClient;
    private final RestClient geniusClient;
    private final CifraClubService cifraClubService;
    private final ObjectMapper objectMapper;

    @Value("${semear.letras.lrclib-user-agent:SemearApp/1.0 (https://github.com/lucascavalcante25/semear-app)}")
    private String lrclibUserAgent;

    @Value("${semear.genius.access-token:}")
    private String geniusAccessToken;

    public record ResultadoLetra(String texto, String fonte) {}

    public LetraLouvorService(CifraClubService cifraClubService, ObjectMapper objectMapper) {
        this.cifraClubService = cifraClubService;
        this.objectMapper = objectMapper;
        this.lrclibClient = RestClient.builder()
            .baseUrl(LRCLIB_BASE)
            .defaultHeader("User-Agent", "SemearApp/1.0 (https://github.com/lucascavalcante25/semear-app)")
            .build();
        this.geniusClient = RestClient.create();
    }

    public Optional<ResultadoLetra> buscarLetra(String artista, String titulo, String cifraUrl) {
        if (artista == null || artista.isBlank() || titulo == null || titulo.isBlank()) {
            return Optional.empty();
        }

        Optional<ResultadoLetra> cifraClub = buscarLetraCifraClub(artista.trim(), titulo.trim(), cifraUrl);
        if (cifraClub.isPresent()) {
            return cifraClub;
        }

        Optional<ResultadoLetra> lrclib = buscarLrclib(artista.trim(), titulo.trim());
        if (lrclib.isPresent()) {
            return lrclib;
        }

        if (geniusAccessToken != null && !geniusAccessToken.isBlank()) {
            Optional<ResultadoLetra> genius = buscarGenius(artista.trim(), titulo.trim());
            if (genius.isPresent()) {
                return genius;
            }
        }

        Optional<ResultadoLetra> cifra = extrairLetraDaCifra(artista.trim(), titulo.trim(), cifraUrl);
        if (cifra.isPresent()) {
            return cifra;
        }

        return Optional.empty();
    }

    private Optional<ResultadoLetra> buscarLrclib(String artista, String titulo) {
        try {
            String getUri = UriComponentsBuilder.fromPath("/get")
                .queryParam("artist_name", artista)
                .queryParam("track_name", titulo)
                .build()
                .toUriString();

            String body = lrclibClient.get()
                .uri(getUri)
                .header("User-Agent", lrclibUserAgent)
                .retrieve()
                .body(String.class);

            Optional<ResultadoLetra> direto = parseLrclibBody(body, "lrclib");
            if (direto.isPresent()) {
                return direto;
            }

            String searchUri = UriComponentsBuilder.fromPath("/search")
                .queryParam("q", artista + " " + titulo)
                .build()
                .toUriString();

            body = lrclibClient.get()
                .uri(searchUri)
                .header("User-Agent", lrclibUserAgent)
                .retrieve()
                .body(String.class);

            if (body == null || body.isBlank()) {
                return Optional.empty();
            }

            JsonNode results = objectMapper.readTree(body);
            if (!results.isArray() || results.isEmpty()) {
                return Optional.empty();
            }

            JsonNode melhor = escolherMelhorResultadoLrclib(results, artista, titulo);
            if (melhor == null) {
                return Optional.empty();
            }

            String texto = textoLrclib(melhor);
            if (texto == null || texto.isBlank()) {
                return Optional.empty();
            }
            return Optional.of(new ResultadoLetra(texto.trim(), "lrclib"));
        } catch (Exception e) {
            log.debug("LRCLIB indisponível para {} - {}: {}", artista, titulo, e.getMessage());
            return Optional.empty();
        }
    }

    private Optional<ResultadoLetra> parseLrclibBody(String body, String fonte) {
        if (body == null || body.isBlank()) {
            return Optional.empty();
        }
        try {
            JsonNode node = objectMapper.readTree(body);
            String texto = textoLrclib(node);
            if (texto == null || texto.isBlank()) {
                return Optional.empty();
            }
            return Optional.of(new ResultadoLetra(texto.trim(), fonte));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private String textoLrclib(JsonNode node) {
        String plain = node.path("plainLyrics").asText(null);
        if (plain != null && !plain.isBlank()) {
            return plain;
        }
        String synced = node.path("syncedLyrics").asText(null);
        if (synced != null && !synced.isBlank()) {
            return synced.replaceAll("\\[\\d{2}:\\d{2}\\.\\d{2}\\]", "").trim();
        }
        return null;
    }

    private JsonNode escolherMelhorResultadoLrclib(JsonNode results, String artista, String titulo) {
        String artistaNorm = normalizar(artista);
        String tituloNorm = normalizar(titulo);
        JsonNode melhor = null;
        int melhorScore = -1;

        for (JsonNode item : results) {
            int score = 0;
            if (normalizar(item.path("artistName").asText("")).contains(artistaNorm)) {
                score += 2;
            }
            if (normalizar(item.path("trackName").asText("")).contains(tituloNorm)) {
                score += 2;
            }
            if (textoLrclib(item) != null) {
                score += 1;
            }
            if (score > melhorScore) {
                melhorScore = score;
                melhor = item;
            }
        }
        return melhorScore >= 2 ? melhor : null;
    }

    private Optional<ResultadoLetra> buscarGenius(String artista, String titulo) {
        try {
            String searchUri = UriComponentsBuilder.fromUriString(GENIUS_BASE + "/search")
                .queryParam("q", artista + " " + titulo)
                .build()
                .toUriString();

            String body = geniusClient.get()
                .uri(searchUri)
                .header("Authorization", "Bearer " + geniusAccessToken)
                .retrieve()
                .body(String.class);

            if (body == null || body.isBlank()) {
                return Optional.empty();
            }

            JsonNode hits = objectMapper.readTree(body).path("response").path("hits");
            if (!hits.isArray() || hits.isEmpty()) {
                return Optional.empty();
            }

            String path = hits.get(0).path("result").path("path").asText(null);
            if (path == null || path.isBlank()) {
                return Optional.empty();
            }

            org.jsoup.nodes.Document doc = org.jsoup.Jsoup.connect("https://genius.com" + path)
                .userAgent(lrclibUserAgent)
                .timeout(15_000)
                .get();

            org.jsoup.nodes.Element container = doc.selectFirst("[data-lyrics-container=true]");
            if (container == null) {
                return Optional.empty();
            }

            String texto = container.text();
            if (texto.isBlank()) {
                return Optional.empty();
            }
            return Optional.of(new ResultadoLetra(texto.trim(), "genius"));
        } catch (Exception e) {
            log.debug("Genius indisponível para {} - {}: {}", artista, titulo, e.getMessage());
            return Optional.empty();
        }
    }

    private Optional<ResultadoLetra> buscarLetraCifraClub(String artista, String titulo, String cifraUrl) {
        Optional<CifraClubService.ResultadoCifra> letra = cifraClubService.buscarLetra(artista, titulo, cifraUrl);
        if (letra.isEmpty()) {
            return Optional.empty();
        }

        List<String> linhasLetra = new ArrayList<>();
        for (String linha : letra.get().linhas()) {
            String trimmed = linha.trim();
            if (trimmed.isEmpty()) {
                if (!linhasLetra.isEmpty() && !linhasLetra.get(linhasLetra.size() - 1).isEmpty()) {
                    linhasLetra.add("");
                }
                continue;
            }
            if (LINHA_TAB.matcher(trimmed).find()) {
                continue;
            }
            linhasLetra.add(trimmed);
        }

        while (!linhasLetra.isEmpty() && linhasLetra.get(linhasLetra.size() - 1).isEmpty()) {
            linhasLetra.remove(linhasLetra.size() - 1);
        }

        if (linhasLetra.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(new ResultadoLetra(String.join("\n", linhasLetra), "cifraclub"));
    }

    private Optional<ResultadoLetra> extrairLetraDaCifra(String artista, String titulo, String cifraUrl) {
        Optional<CifraClubService.ResultadoCifra> cifra = cifraClubService.buscarCifra(artista, titulo, cifraUrl);
        if (cifra.isEmpty()) {
            return Optional.empty();
        }

        List<String> linhasLetra = new ArrayList<>();
        for (String linha : cifra.get().linhas()) {
            String trimmed = linha.trim();
            if (trimmed.isEmpty()) {
                if (!linhasLetra.isEmpty() && !linhasLetra.get(linhasLetra.size() - 1).isEmpty()) {
                    linhasLetra.add("");
                }
                continue;
            }
            if (LINHA_TAB.matcher(trimmed).find()) {
                continue;
            }
            if (trimmed.matches("(?i)^parte\\s+\\d+\\s+de\\s+\\d+$")) {
                continue;
            }
            if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                linhasLetra.add(trimmed);
                continue;
            }

            String semAcordes = trimmed
                .replaceAll("\\b[A-G][#b]?(?:m|maj|min|sus|add|dim|aug)?[0-9]*(?:/[A-G][#b]?)?\\b", " ")
                .replaceAll("\\s+", " ")
                .trim();

            if (semAcordes.length() >= 3 && semAcordes.matches(".*[a-zA-ZÀ-ÿ]{2,}.*")) {
                linhasLetra.add(semAcordes);
            }
        }

        while (!linhasLetra.isEmpty() && linhasLetra.get(linhasLetra.size() - 1).isEmpty()) {
            linhasLetra.remove(linhasLetra.size() - 1);
        }

        if (linhasLetra.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(new ResultadoLetra(String.join("\n", linhasLetra), "cifraclub"));
    }

    private static String normalizar(String valor) {
        return valor == null ? "" : valor.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
    }
}
