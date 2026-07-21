package br.com.semear.repository;

import br.com.semear.domain.EventoBanner;
import java.time.Instant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EventoBannerRepository extends JpaRepository<EventoBanner, Long> {
    @Query("select b.atualizadoEm from EventoBanner b where b.eventoId = :eventoId")
    Instant findAtualizadoEmByEventoId(@Param("eventoId") Long eventoId);
}
