package br.com.semear.service;

import br.com.semear.service.util.LouvorLetraUtils;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Matcher;
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
    private static final Pattern LINK_MUSICA = Pattern.compile(
        "cifraclub\\.com\\.br/([a-z0-9-]+)/([a-z0-9-]+)/?",
        Pattern.CASE_INSENSITIVE
    );

    public record ResultadoCifra(String url, List<String> linhas) {}

    public Optional<ResultadoCifra> buscarCifra(String artista, String titulo, String cifraUrlInformada) {
        for (String url : gerarUrlsCandidatas(artista, titulo, cifraUrlInformada)) {
            Optional<ResultadoCifra> resultado = buscarPorUrl(url);
            if (resultado.isPresent()) {
                return resultado;
            }
        }
        return Optional.empty();
    }

    public Optional<ResultadoCifra> buscarLetra(String artista, String titulo, String cifraUrlInformada) {
        for (String url : gerarUrlsCandidatas(artista, titulo, cifraUrlInformada)) {
            String letraUrl = url.endsWith("/letra/") ? url : url + "letra/";
            Optional<ResultadoCifra> resultado = buscarLetraPorUrl(letraUrl);
            if (resultado.isPresent()) {
                return resultado;
            }
        }
        return Optional.empty();
    }

    public Optional<ResultadoCifra> buscarPorUrl(String url) {
        try {
            Document doc = conectar(url);
            if (doc == null) {
                return Optional.empty();
            }

            Element pre = doc.selectFirst("pre");
            if (pre != null) {
                List<String> linhas = htmlPreParaLinhas(pre.html());
                if (!linhas.isEmpty()) {
                    return Optional.of(new ResultadoCifra(url, linhas));
                }
            }

            return Optional.empty();
        } catch (Exception e) {
            log.debug("Cifra Club sem resultado em {}: {}", url, e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<ResultadoCifra> buscarLetraPorUrl(String url) {
        try {
            Document doc = conectar(url);
            if (doc == null) {
                return Optional.empty();
            }

            Element pre = doc.selectFirst("pre");
            if (pre != null) {
                List<String> linhas = htmlPreParaLinhas(pre.html());
                if (!linhas.isEmpty() && LouvorLetraUtils.pareceLetra(linhas)) {
                    return Optional.of(new ResultadoCifra(url, linhas));
                }
            }

            Element letra = doc.selectFirst("div.letra");
            if (letra != null) {
                List<String> linhas = htmlLetraParaLinhas(letra.html());
                if (!linhas.isEmpty() && !LouvorLetraUtils.pareceCifra(String.join("\n", linhas))) {
                    return Optional.of(new ResultadoCifra(url, linhas));
                }
            }

            return Optional.empty();
        } catch (Exception e) {
            log.debug("Cifra Club letra sem resultado em {}: {}", url, e.getMessage());
            return Optional.empty();
        }
    }

    private List<String> gerarUrlsCandidatas(String artista, String titulo, String cifraUrlInformada) {
        LinkedHashSet<String> urls = new LinkedHashSet<>();

        if (cifraUrlInformada != null && !cifraUrlInformada.isBlank()) {
            String normalizada = normalizarUrl(cifraUrlInformada.trim());
            if (normalizada != null) {
                urls.add(normalizada);
            }
        }

        if (artista == null || artista.isBlank() || titulo == null || titulo.isBlank()) {
            return new ArrayList<>(urls);
        }

        List<String> artistSlugs = gerarSlugsArtista(artista);
        List<String> titleSlugs = gerarSlugsTitulo(titulo);

        for (String artistSlug : artistSlugs) {
            for (String titleSlug : titleSlugs) {
                urls.add(BASE_URL + artistSlug + "/" + titleSlug + "/");
            }
            urls.addAll(buscarSlugsNaPaginaArtista(artistSlug, titulo));
        }

        return ordenarUrlsPorPreferenciaIdioma(new ArrayList<>(urls), titulo);
    }

    private List<String> buscarSlugsNaPaginaArtista(String artistSlug, String titulo) {
        List<String> urls = new ArrayList<>();
        try {
            Document doc = Jsoup.connect(BASE_URL + artistSlug + "/")
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                .timeout(12_000)
                .get();

            String tituloSlug = slugify(titulo);
            String tituloNorm = normalizar(titulo);

            Matcher matcher = LINK_MUSICA.matcher(doc.html());
            while (matcher.find()) {
                String slugArtista = matcher.group(1);
                String slugMusica = matcher.group(2);
                if (!slugArtista.equals(artistSlug)) {
                    continue;
                }
                if (
                    slugMusica.equals(tituloSlug) ||
                    slugMusica.startsWith(tituloSlug) ||
                    slugMusica.contains(tituloSlug) ||
                    normalizar(slugMusica).contains(tituloNorm)
                ) {
                    urls.add(BASE_URL + slugArtista + "/" + slugMusica + "/");
                }
            }
        } catch (Exception e) {
            log.debug("Não foi possível listar músicas de {}: {}", artistSlug, e.getMessage());
        }
        return urls;
    }

    private List<String> gerarSlugsArtista(String artista) {
        String base = slugify(artista);
        LinkedHashSet<String> slugs = new LinkedHashSet<>();
        if (!base.isBlank()) {
            slugs.add(base);
            if (!base.endsWith("-united")) {
                slugs.add(base + "-united");
            }
            if (!base.endsWith("-worship")) {
                slugs.add(base + "-worship");
            }
            if (base.contains("hillsong")) {
                slugs.add("hillsong-em-portugues");
                slugs.add("hillsong-brasil");
            }
        }
        return new ArrayList<>(slugs);
    }

    private List<String> gerarSlugsTitulo(String titulo) {
        String base = slugify(titulo);
        LinkedHashSet<String> slugs = new LinkedHashSet<>();
        if (!base.isBlank()) {
            if (base.contains("oceanos") || base.contains("oceano")) {
                slugs.add("oceanos-versao-em-portugues");
                slugs.add("oceanos-onde-meus-pes-podem-falhar");
            }
            slugs.add(base);
            if (base.contains("oceanos")) {
                slugs.add("oceans-where-feet-may-fail");
            }
            if (base.contains("oceans")) {
                slugs.add("oceanos-versao-em-portugues");
                slugs.add("oceans-where-feet-may-fail");
            }
        }
        return new ArrayList<>(slugs);
    }

    private List<String> ordenarUrlsPorPreferenciaIdioma(List<String> urls, String titulo) {
        urls.sort((a, b) -> Integer.compare(pontuacaoIdiomaUrl(b, titulo), pontuacaoIdiomaUrl(a, titulo)));
        return urls;
    }

    private int pontuacaoIdiomaUrl(String url, String titulo) {
        String slug = url.toLowerCase(Locale.ROOT);
        int score = 0;
        if (slug.contains("versao-em-portugues") || slug.contains("em-portugues")) {
            score += 10;
        }
        if (slug.contains("onde-meus-pes") || slug.contains("hillsong-brasil") || slug.contains("hillsong-em-portugues")) {
            score += 8;
        }
        if (tituloIndicaPortugues(titulo) && slug.contains("where-feet")) {
            score -= 8;
        }
        if (slug.contains("where-feet") || slug.contains("donde-mis")) {
            score -= 6;
        }
        if (slug.endsWith("/letra/")) {
            score += 2;
        }
        return score;
    }

    private boolean tituloIndicaPortugues(String titulo) {
        if (titulo == null || titulo.isBlank()) {
            return false;
        }
        String norm = normalizar(titulo);
        return norm.contains("oceanos") ||
            norm.contains("oceano") ||
            norm.contains("onde") ||
            norm.contains("meus") ||
            norm.contains("pes") ||
            norm.contains("agua");
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

    private static String normalizar(String valor) {
        return slugify(valor).replace("-", "");
    }

    private List<String> htmlPreParaLinhas(String html) {
        return htmlParaLinhas(html);
    }

    private List<String> htmlLetraParaLinhas(String html) {
        return htmlParaLinhas(html);
    }

    private List<String> htmlParaLinhas(String html) {
        if (html == null || html.isBlank()) {
            return List.of();
        }
        String comQuebras = html
            .replace("&nbsp;", " ")
            .replaceAll("(?i)<br\\s*/?>", "\n")
            .replaceAll("(?i)</p>", "\n")
            .replaceAll("(?i)</div>", "\n")
            .replaceAll("(?i)<div[^>]*>", "");
        String texto = Jsoup.clean(
            comQuebras,
            "",
            Safelist.none(),
            new org.jsoup.nodes.Document.OutputSettings().prettyPrint(false)
        );
        texto = texto.replace("\r\n", "\n").replace('\r', '\n');
        String[] partes = texto.split("\n", -1);
        List<String> linhas = new ArrayList<>(partes.length);
        for (String parte : partes) {
            linhas.add(parte.stripTrailing());
        }
        while (!linhas.isEmpty() && linhas.get(linhas.size() - 1).isBlank()) {
            linhas.remove(linhas.size() - 1);
        }
        return linhas;
    }

    private Document conectar(String url) {
        try {
            return Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                .timeout(15_000)
                .get();
        } catch (Exception e) {
            log.debug("Falha ao acessar {}: {}", url, e.getMessage());
            return null;
        }
    }
}
