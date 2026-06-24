package br.com.semear.repository;

import br.com.semear.domain.EventoInscricao;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventoInscricaoRepository extends JpaRepository<EventoInscricao, Long> {
    List<EventoInscricao> findByEventoId(Long eventoId);
    Optional<EventoInscricao> findByEventoIdAndUserId(Long eventoId, Long userId);
    Optional<EventoInscricao> findByIdAndEventoId(Long id, Long eventoId);
    long countByEventoId(Long eventoId);
    void deleteByEventoIdAndUserId(Long eventoId, Long userId);
}
