package br.com.semear.repository;

import br.com.semear.domain.Evento;
import br.com.semear.domain.enumeration.CategoriaEvento;
import br.com.semear.domain.enumeration.PublicoEvento;
import br.com.semear.domain.enumeration.StatusEvento;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EventoRepository extends JpaRepository<Evento, Long> {
    List<Evento> findByIgrejaIdOrderByDataInicioDesc(Long igrejaId);

    Optional<Evento> findByIdAndIgrejaId(Long id, Long igrejaId);

    List<Evento> findByIgrejaIdAndPublicoAndDataInicioAfterOrderByDataInicioAsc(Long igrejaId, PublicoEvento publico, Instant after);

    List<Evento> findByIgrejaIdAndDataInicioAfterOrderByDataInicioAsc(Long igrejaId, Instant after);

    List<Evento> findByIgrejaIdAndDataInicioBeforeOrderByDataInicioDesc(Long igrejaId, Instant before);

    List<Evento> findByIgrejaIdAndPublicoAndStatusAndDataInicioAfterOrderByDataInicioAsc(
        Long igrejaId,
        PublicoEvento publico,
        StatusEvento status,
        Instant after
    );

    @Query(
        """
        SELECT e FROM Evento e
        WHERE e.igreja.id = :igrejaId
        AND (:categoria IS NULL OR e.categoria = :categoria)
        AND (:publico IS NULL OR e.publico = :publico)
        AND (:status IS NULL OR e.status = :status)
        AND (:inscricoesAbertas IS NULL OR e.inscricoesAbertas = :inscricoesAbertas)
        AND e.dataInicio > :apos
        AND e.dataInicio < :antes
        ORDER BY e.dataInicio ASC
        """
    )
    List<Evento> buscarComFiltros(
        @Param("igrejaId") Long igrejaId,
        @Param("categoria") CategoriaEvento categoria,
        @Param("publico") PublicoEvento publico,
        @Param("status") StatusEvento status,
        @Param("inscricoesAbertas") Boolean inscricoesAbertas,
        @Param("apos") Instant apos,
        @Param("antes") Instant antes
    );
}
