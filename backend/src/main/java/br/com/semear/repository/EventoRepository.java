package br.com.semear.repository;

import br.com.semear.domain.Evento;
import br.com.semear.domain.enumeration.PublicoEvento;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventoRepository extends JpaRepository<Evento, Long> {
    List<Evento> findByIgrejaIdOrderByDataInicioDesc(Long igrejaId);
    Optional<Evento> findByIdAndIgrejaId(Long id, Long igrejaId);
    List<Evento> findByIgrejaIdAndPublicoAndDataInicioAfterOrderByDataInicioAsc(Long igrejaId, PublicoEvento publico, Instant after);
}
