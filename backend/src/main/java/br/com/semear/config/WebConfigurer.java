package br.com.semear.config;

import jakarta.servlet.*;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.servlet.ServletContextInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.util.CollectionUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import tech.jhipster.config.JHipsterProperties;

/**
 * Configuration of web application with Servlet 3.0 APIs.
 */
@Configuration
public class WebConfigurer implements ServletContextInitializer {

    private static final Logger LOG = LoggerFactory.getLogger(WebConfigurer.class);
    private static final String ORIGIN_APP = "https://minha-igreja-digital-app.vercel.app";
    private static final String ORIGIN_VERCEL_PATTERN = "https://*.vercel.app";

    private final Environment env;

    private final JHipsterProperties jHipsterProperties;

    public WebConfigurer(Environment env, JHipsterProperties jHipsterProperties) {
        this.env = env;
        this.jHipsterProperties = jHipsterProperties;
    }

    @Override
    public void onStartup(ServletContext servletContext) {
        if (env.getActiveProfiles().length != 0) {
            LOG.info("Web application configuration, using profiles: {}", (Object[]) env.getActiveProfiles());
        }

        LOG.info("Web application fully configured");
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = corsConfigResolvido();
        if (!CollectionUtils.isEmpty(config.getAllowedOrigins()) || !CollectionUtils.isEmpty(config.getAllowedOriginPatterns())) {
            LOG.info("CORS origins={} patterns={}", config.getAllowedOrigins(), config.getAllowedOriginPatterns());
            source.registerCorsConfiguration("/**", config);
        } else {
            LOG.warn("CORS desativado: nenhum origin configurado (SEMEAR_CORS_ORIGINS)");
        }
        return source;
    }

    @Bean
    public CorsFilter corsFilter() {
        return new CorsFilter(corsConfigurationSource());
    }

    private CorsConfiguration corsConfigResolvido() {
        CorsConfiguration config = new CorsConfiguration(jHipsterProperties.getCors());
        config.setAllowedOrigins(semVazios(config.getAllowedOrigins()));
        config.setAllowedOriginPatterns(semVazios(config.getAllowedOriginPatterns()));

        boolean vazio =
            CollectionUtils.isEmpty(config.getAllowedOrigins()) && CollectionUtils.isEmpty(config.getAllowedOriginPatterns());
        if (env.matchesProfiles("prod")) {
            List<String> origins = config.getAllowedOrigins() == null ? new ArrayList<>() : new ArrayList<>(config.getAllowedOrigins());
            if (!origins.contains(ORIGIN_APP)) {
                origins.add(ORIGIN_APP);
            }
            config.setAllowedOrigins(origins);
            List<String> patterns =
                config.getAllowedOriginPatterns() == null ? new ArrayList<>() : new ArrayList<>(config.getAllowedOriginPatterns());
            if (!patterns.contains(ORIGIN_VERCEL_PATTERN)) {
                patterns.add(ORIGIN_VERCEL_PATTERN);
            }
            config.setAllowedOriginPatterns(patterns);
            if (CollectionUtils.isEmpty(config.getAllowedMethods())) {
                config.setAllowedMethods(List.of("*"));
            }
            if (CollectionUtils.isEmpty(config.getAllowedHeaders())) {
                config.setAllowedHeaders(List.of("*"));
            }
            if (config.getAllowCredentials() == null) {
                config.setAllowCredentials(true);
            }
            if (vazio) {
                LOG.warn("SEMEAR_CORS_ORIGINS vazio; usando fallback {}", ORIGIN_APP);
            }
        }
        return config;
    }

    private static List<String> semVazios(List<String> valores) {
        if (valores == null) {
            return null;
        }
        List<String> limpos = new ArrayList<>();
        for (String valor : valores) {
            if (valor != null && !valor.isBlank()) {
                limpos.add(valor.trim());
            }
        }
        return limpos;
    }
}
