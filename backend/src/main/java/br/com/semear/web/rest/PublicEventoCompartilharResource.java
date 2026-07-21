package br.com.semear.web.rest;

import br.com.semear.domain.Evento;
import br.com.semear.domain.Igreja;
import br.com.semear.domain.enumeration.StatusEvento;
import br.com.semear.repository.EventoBannerRepository;
import br.com.semear.repository.EventoRepository;
import br.com.semear.service.EventoService;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.config.JHipsterProperties;

/**
 * Página pública de compartilhamento (Open Graph) para WhatsApp e redes.
 * Crawlers leem og:image/og:title; pessoas abrem e seguem para o app.
 */
@RestController
@RequestMapping("/api/public/eventos")
public class PublicEventoCompartilharResource {

    private static final ZoneId ZONE_BR = ZoneId.of("America/Sao_Paulo");
    private static final DateTimeFormatter DATA_FMT = DateTimeFormatter.ofPattern(
        "EEE, d 'de' MMM, HH:mm",
        Locale.forLanguageTag("pt-BR")
    );

    private final EventoRepository eventoRepository;
    private final EventoService eventoService;
    private final EventoBannerRepository eventoBannerRepository;
    private final JHipsterProperties jHipsterProperties;

    /** URL pública da API (Render). Necessária quando a página é acessada via proxy da Vercel. */
    @Value("${semear.public-api-url:https://semear-api-pl65.onrender.com}")
    private String publicApiUrl;

    public PublicEventoCompartilharResource(
        EventoRepository eventoRepository,
        EventoService eventoService,
        EventoBannerRepository eventoBannerRepository,
        JHipsterProperties jHipsterProperties
    ) {
        this.eventoRepository = eventoRepository;
        this.eventoService = eventoService;
        this.eventoBannerRepository = eventoBannerRepository;
        this.jHipsterProperties = jHipsterProperties;
    }

    @GetMapping(value = "/{id}/compartilhar", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> compartilhar(@PathVariable Long id) {
        Evento evento = eventoRepository.findByIdWithIgreja(id).orElse(null);
        if (evento == null || evento.getStatus() == StatusEvento.RASCUNHO) {
            return ResponseEntity.notFound().build();
        }

        String apiBase = resolverApiBasePublica();
        String appBase = trimSlash(jHipsterProperties.getMail().getBaseUrl());
        if (appBase == null || appBase.isBlank()) {
            appBase = "https://minha-igreja-digital-app.vercel.app";
        }
        String linkApp = appBase + "/eventos?eventoId=" + id;
        String paginaUrl = appBase + "/e/" + id;

        // Só marca banner se o arquivo existir de fato (evita og:image quebrado).
        boolean temBanner = eventoService.obterBanner(id).isPresent();
        // Versão estável baseada na última atualização do banner: o WhatsApp reaproveita
        // a prévia em cache e só rebusca quando o banner realmente muda.
        Instant bannerAtualizadoEm = temBanner ? eventoBannerRepository.findAtualizadoEmByEventoId(id) : null;
        long versaoBanner = bannerAtualizadoEm != null ? bannerAtualizadoEm.getEpochSecond() : 0;
        String imagemUrl = temBanner ? apiBase + "/api/public/eventos/" + id + "/banner?v=" + versaoBanner : "";

        Igreja igreja = evento.getIgreja();
        String nomeIgreja = igreja != null
            ? (igreja.getNomeFantasia() != null && !igreja.getNomeFantasia().isBlank()
                    ? igreja.getNomeFantasia()
                    : igreja.getNome())
            : "Igreja";

        String titulo = evento.getTitulo() != null ? evento.getTitulo().trim() : "Evento";
        String descricao = montarDescricaoOg(evento, nomeIgreja);
        String dataFmt = evento.getDataInicio() != null
            ? DATA_FMT.format(evento.getDataInicio().atZone(ZONE_BR))
            : "";
        String local = evento.getLocal() != null ? evento.getLocal().trim() : "";

        String metaImagem = temBanner
            ? """
              <meta property="og:image" content="%s" />
              <meta property="og:image:secure_url" content="%s" />
              <meta property="og:image:type" content="image/jpeg" />
              <meta property="og:image:width" content="1200" />
              <meta property="og:image:height" content="630" />
              <meta property="og:image:alt" content="%s" />
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:image" content="%s" />
              """.formatted(esc(imagemUrl), esc(imagemUrl), esc(titulo), esc(imagemUrl))
            : """
              <meta name="twitter:card" content="summary" />
              """;

        String html = """
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <title>%s</title>
              <meta name="description" content="%s" />
              <meta property="og:type" content="website" />
              <meta property="og:site_name" content="%s" />
              <meta property="og:title" content="%s" />
              <meta property="og:description" content="%s" />
              <meta property="og:url" content="%s" />
              %s
              <meta property="og:locale" content="pt_BR" />
              <meta name="twitter:title" content="%s" />
              <meta name="twitter:description" content="%s" />
              <style>
                body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f4f6f1;color:#1f2a1a}
                .wrap{max-width:420px;margin:0 auto;padding:24px 16px}
                .card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,.08)}
                img{display:block;width:100%%;aspect-ratio:16/9;object-fit:cover;background:#e8ece3}
                .body{padding:18px 16px 20px}
                h1{margin:0 0 6px;font-size:1.25rem;line-height:1.3}
                .meta{margin:0;color:#5c6b55;font-size:.9rem}
                .igreja{margin:0 0 10px;color:#5a7a3a;font-weight:600;font-size:.85rem}
                p{margin:10px 0 0;color:#3d4a38;font-size:.95rem;line-height:1.45}
                a.btn{display:block;margin-top:16px;text-align:center;background:#5a7a3a;color:#fff;text-decoration:none;
                  padding:12px 16px;border-radius:10px;font-weight:600}
                .hint{margin-top:12px;text-align:center;color:#7a8774;font-size:.8rem}
              </style>
            </head>
            <body>
              <div class="wrap">
                <div class="card">
                  %s
                  <div class="body">
                    <p class="igreja">%s</p>
                    <h1>%s</h1>
                    %s
                    %s
                    %s
                    <a class="btn" href="%s">Abrir no app</a>
                    <p class="hint">Toque no botão para ver o evento e se inscrever.</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
            """.formatted(
            esc(titulo),
            esc(descricao),
            esc(nomeIgreja),
            esc(titulo),
            esc(descricao),
            esc(paginaUrl),
            metaImagem,
            esc(titulo),
            esc(descricao),
            temBanner
                ? "<img src=\"" + esc(imagemUrl) + "\" alt=\"" + esc(titulo) + "\" />"
                : "",
            esc(nomeIgreja),
            esc(titulo),
            dataFmt.isBlank() ? "" : "<p class=\"meta\">" + esc(dataFmt) + "</p>",
            local.isBlank() ? "" : "<p class=\"meta\">" + esc(local) + "</p>",
            evento.getDescricao() != null && !evento.getDescricao().isBlank()
                ? "<p>" + esc(truncar(evento.getDescricao().trim(), 220)) + "</p>"
                : "",
            esc(linkApp)
        );

        return ResponseEntity.ok()
            .contentType(MediaType.TEXT_HTML)
            .header(HttpHeaders.CACHE_CONTROL, "public, max-age=300")
            .body(html);
    }

    /** Banner público para og:image (WhatsApp/crawlers). URL versionada (?v=) permite cache longo. */
    @GetMapping("/{id}/banner")
    public ResponseEntity<byte[]> bannerPublico(@PathVariable Long id) {
        return eventoService
            .obterBanner(id)
            .map(banner ->
                ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(banner.contentType()))
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                    .body(banner.bytes())
            )
            .orElse(ResponseEntity.notFound().build());
    }

    private String resolverApiBasePublica() {
        String configurada = trimSlash(publicApiUrl);
        if (configurada != null && !configurada.isBlank()) {
            return configurada;
        }
        return ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString().replaceAll("/$", "");
    }

    private static String montarDescricaoOg(Evento evento, String nomeIgreja) {
        StringBuilder sb = new StringBuilder();
        if (nomeIgreja != null && !nomeIgreja.isBlank()) {
            sb.append(nomeIgreja);
        }
        if (evento.getDataInicio() != null) {
            if (!sb.isEmpty()) sb.append(" · ");
            sb.append(DATA_FMT.format(evento.getDataInicio().atZone(ZONE_BR)));
        }
        if (evento.getLocal() != null && !evento.getLocal().isBlank()) {
            if (!sb.isEmpty()) sb.append(" · ");
            sb.append(evento.getLocal().trim());
        }
        if (evento.getDescricao() != null && !evento.getDescricao().isBlank()) {
            if (!sb.isEmpty()) sb.append(" — ");
            sb.append(truncar(evento.getDescricao().trim().replaceAll("\\s+", " "), 140));
        }
        if (sb.isEmpty()) {
            return "Confira este evento e participe pelo app.";
        }
        return sb.toString();
    }

    private static String truncar(String texto, int max) {
        if (texto.length() <= max) return texto;
        return texto.substring(0, max - 1).trim() + "…";
    }

    private static String esc(String s) {
        if (s == null) return "";
        return s
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#39;");
    }

    private static String trimSlash(String url) {
        if (url == null) return null;
        return url.replaceAll("/$", "");
    }
}
