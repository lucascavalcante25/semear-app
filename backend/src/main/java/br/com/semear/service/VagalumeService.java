package br.com.semear.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class VagalumeService {

    private static final Logger log = LoggerFactory.getLogger(VagalumeService.class);
    private static final String BASE_URL = "https://api.vagalume.com.br/search.php";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${semear.vagalume.api-key:}")
    private String apiKey;

    public VagalumeService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restClient = RestClient.create();
    }

    public boolean isConfigurado() {
        return apiKey != null && !apiKey.isBlank();
    }

    public Optional<String> buscarLetra(String artista, String titulo) {
        if (!isConfigurado()) {
            log.warn("Vagalume API key não configurada (semear.vagalume.api-key)");
            return Optional.empty();
        }
        if (artista == null || artista.isBlank() || titulo == null || titulo.isBlank()) {
            return Optional.empty();
        }

        try {
            String uri = UriComponentsBuilder.fromUriString(BASE_URL)
                .queryParam("apikey", apiKey)
                .queryParam("art", artista.trim())
                .queryParam("mus", titulo.trim())
                .build()
                .toUriString();

            String body = restClient.get().uri(uri).retrieve().body(String.class);
            if (body == null || body.isBlank()) {
                return Optional.empty();
            }

            JsonNode root = objectMapper.readTree(body);
            JsonNode musArray = root.path("mus");
            if (!musArray.isArray() || musArray.isEmpty()) {
                return Optional.empty();
            }

            String texto = null;
            for (JsonNode mus : musArray) {
                String candidate = mus.path("text").asText(null);
                if (candidate != null && !candidate.isBlank()) {
                    texto = candidate;
                    break;
                }
            }
            if (texto == null || texto.isBlank()) {
                return Optional.empty();
            }
            return Optional.of(texto.trim());
        } catch (Exception e) {
            log.warn("Falha ao buscar letra no Vagalume para {} - {}: {}", artista, titulo, e.getMessage());
            return Optional.empty();
        }
    }
}
