package br.com.semear.repository;

import br.com.semear.domain.EventoInscricao;
import br.com.semear.domain.enumeration.StatusInscricaoEvento;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventoInscricaoRepository extends JpaRepository<EventoInscricao, Long> {
    List<EventoInscricao> findByEventoId(Long eventoId);

    List<EventoInscricao> findByEventoIdAndStatus(Long eventoId, StatusInscricaoEvento status);

    Optional<EventoInscricao> findByEventoIdAndUserId(Long eventoId, Long userId);

    Optional<EventoInscricao> findByIdAndEventoId(Long id, Long eventoId);

    long countByEventoId(Long eventoId);

    long countByEventoIdAndStatus(Long eventoId, StatusInscricaoEvento status);

    void deleteByEventoIdAndUserId(Long eventoId, Long userId);

    List<EventoInscricao> findByUserIdAndStatusAndEventoIgrejaIdOrderByCriadoEmDesc(
        Long userId,
        StatusInscricaoEvento status,
        Long igrejaId
    );
}
