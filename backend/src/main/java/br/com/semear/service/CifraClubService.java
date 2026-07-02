package br.com.semear.service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Pattern;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.safety.Safelist;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class CifraClubService {

    private static final Logger log = LoggerFactory.getLogger(CifraClubService.class);
    private static final String BASE_URL = "https://www.cifraclub.com.br/";
    private static final Pattern URL_CIFRA_CLUB = Pattern.compile(
        "cifraclub\\.com\\.br/([^/]+)/([^/?#]+)",
        Pattern.CASE_INSENSITIVE
    );

    public record ResultadoCifra(String url, List<String> linhas) {}

    public Optional<ResultadoCifra> buscarCifra(String artista, String titulo, String cifraUrlInformada) {
        Optional<String> url = resolverUrl(artista, titulo, cifraUrlInformada);
        if (url.isEmpty()) {
            return Optional.empty();
        }
        return buscarPorUrl(url.get());
    }

    public Optional<ResultadoCifra> buscarPorUrl(String url) {
        try {
            Document doc = Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (compatible; SemearApp/1.0)")
                .timeout(15_000)
                .get();

            Element pre = doc.selectFirst("pre");
            if (pre == null) {
                log.warn("Cifra Club: tag pre não encontrada em {}", url);
                return Optional.empty();
            }

            List<String> linhas = htmlPreParaLinhas(pre.html());
            if (linhas.isEmpty()) {
                return Optional.empty();
            }
            return Optional.of(new ResultadoCifra(url, linhas));
        } catch (Exception e) {
            log.warn("Falha ao buscar cifra no Cifra Club ({}): {}", url, e.getMessage());
            return Optional.empty();
        }
    }

    private Optional<String> resolverUrl(String artista, String titulo, String cifraUrlInformada) {
        if (cifraUrlInformada != null && !cifraUrlInformada.isBlank()) {
            String normalizada = normalizarUrl(cifraUrlInformada.trim());
            if (normalizada != null) {
                return Optional.of(normalizada);
            }
        }
        if (artista == null || artista.isBlank() || titulo == null || titulo.isBlank()) {
            return Optional.empty();
        }
        String artistSlug = slugify(artista);
        String songSlug = slugify(titulo);
        if (artistSlug.isBlank() || songSlug.isBlank()) {
            return Optional.empty();
        }
        return Optional.of(BASE_URL + artistSlug + "/" + songSlug + "/");
    }

    private String normalizarUrl(String url) {
        if (!url.contains("cifraclub.com")) {
            return null;
        }
        var matcher = URL_CIFRA_CLUB.matcher(url);
        if (matcher.find()) {
            return BASE_URL + matcher.group(1) + "/" + matcher.group(2) + "/";
        }
        if (url.startsWith("http")) {
            return url.endsWith("/") ? url : url + "/";
        }
        return null;
    }

    static String slugify(String input) {
        if (input == null) {
            return "";
        }
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return normalized
            .toLowerCase(Locale.ROOT)
            .replaceAll("[^a-z0-9\\s-]", "")
            .trim()
            .replaceAll("\\s+", "-")
            .replaceAll("-+", "-");
    }

    private List<String> htmlPreParaLinhas(String html) {
        String comQuebras = html.replaceAll("(?i)<br\\s*/?>", "\n");
        String texto = Jsoup.clean(comQuebras, "", Safelist.none(), new org.jsoup.nodes.Document.OutputSettings().prettyPrint(false));
        texto = texto.replace("\r\n", "\n").replace('\r', '\n');
        String[] partes = texto.split("\n", -1);
        List<String> linhas = new ArrayList<>(partes.length);
        for (String parte : partes) {
            linhas.add(parte.stripTrailing());
        }
        return linhas;
    }
}
