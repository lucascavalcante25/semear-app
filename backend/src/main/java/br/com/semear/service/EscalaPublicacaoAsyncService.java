package br.com.semear.service;

import br.com.semear.domain.EscalaItem;
import br.com.semear.repository.EscalaItemRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Notificações de publicação de escala fora da requisição HTTP.
 */
@Service
public class EscalaPublicacaoAsyncService {

    private static final Logger LOG = LoggerFactory.getLogger(EscalaPublicacaoAsyncService.class);

    private final EscalaItemRepository escalaItemRepository;
    private final NotificacaoService notificacaoService;

    public EscalaPublicacaoAsyncService(
        EscalaItemRepository escalaItemRepository,
        NotificacaoService notificacaoService
    ) {
        this.escalaItemRepository = escalaItemRepository;
        this.notificacaoService = notificacaoService;
    }

    @Async
    @Transactional(readOnly = true)
    public void notificarAtribuicoesAposPublicacao(List<Long> escalaIds) {
        if (escalaIds == null || escalaIds.isEmpty()) {
            return;
        }
        try {
            List<EscalaItem> itens = escalaItemRepository.findByEscalaIdInWithUser(escalaIds);
            int enviadas = 0;
            for (EscalaItem item : itens) {
                if (item.getEscala() == null) {
                    continue;
                }
                // Status já está PUBLICADA no banco; garante elegibilidade no objeto em memória.
                item.getEscala().setStatus(br.com.semear.domain.enumeration.StatusEscalaPublicacao.PUBLICADA);
                notificacaoService.notificarEscalaItemAtribuido(item.getEscala(), item);
                enviadas++;
            }
            LOG.info("Notificações de publicação de escala: {} itens em {} escalas", enviadas, escalaIds.size());
        } catch (Exception e) {
            LOG.warn("Falha ao notificar atribuições após publicação: {}", e.getMessage());
        }
    }
}
