package br.com.semear.service.util;

import br.com.semear.service.dto.ConfigNotificacaoDTO;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class ConfigNotificacaoJsonUtil {

    private static final Logger LOG = LoggerFactory.getLogger(ConfigNotificacaoJsonUtil.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private ConfigNotificacaoJsonUtil() {}

    public static ConfigNotificacaoDTO parse(String json) {
        if (json == null || json.isBlank()) {
            return padraoDesativado();
        }
        try {
            ConfigNotificacaoDTO dto = MAPPER.readValue(json, ConfigNotificacaoDTO.class);
            return dto != null ? dto : padraoDesativado();
        } catch (JsonProcessingException e) {
            LOG.warn("JSON de config notificação inválido: {}", e.getMessage());
            return padraoDesativado();
        }
    }

    public static String serializar(ConfigNotificacaoDTO dto) {
        if (dto == null) {
            return null;
        }
        try {
            return MAPPER.writeValueAsString(dto);
        } catch (JsonProcessingException e) {
            LOG.warn("Erro ao serializar config notificação: {}", e.getMessage());
            return null;
        }
    }

    public static ConfigNotificacaoDTO padraoDesativado() {
        ConfigNotificacaoDTO dto = new ConfigNotificacaoDTO();
        dto.setAtivo(false);
        return dto;
    }
}
