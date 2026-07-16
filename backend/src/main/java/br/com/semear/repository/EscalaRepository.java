package br.com.semear.repository;

import br.com.semear.domain.Escala;
import br.com.semear.domain.enumeration.CodigoDepartamento;
import br.com.semear.domain.enumeration.StatusEscalaPublicacao;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EscalaRepository extends JpaRepository<Escala, Long> {
    List<Escala> findByIgrejaIdOrderByDataEventoDesc(Long igrejaId);
    List<Escala> findByIgrejaIdAndStatusOrderByDataEventoDesc(Long igrejaId, StatusEscalaPublicacao status);
    Optional<Escala> findByIdAndIgrejaId(Long id, Long igrejaId);
    List<Escala> findByGeracaoId(Long geracaoId);

    @Query(
        """
        SELECT e FROM Escala e
        LEFT JOIN FETCH e.departamento
        LEFT JOIN FETCH e.cultoRegistro
        WHERE e.igreja.id = :igrejaId
        AND e.cultoRegistro.id IN :cultoIds
        AND e.status = :status
        AND e.dataEvento >= :inicio
        AND e.dataEvento < :fim
        """
    )
    List<Escala> findByIgrejaCultosAndPeriodo(
        @Param("igrejaId") Long igrejaId,
        @Param("cultoIds") List<Long> cultoIds,
        @Param("inicio") Instant inicio,
        @Param("fim") Instant fim,
        @Param("status") StatusEscalaPublicacao status
    );

    @Query(
        """
        SELECT e FROM Escala e
        LEFT JOIN FETCH e.departamento
        WHERE e.igreja.id = :igrejaId
        AND e.status = :status
        AND e.dataEvento >= :inicio
        AND e.dataEvento < :fim
        AND e.departamento IS NOT NULL
        AND (
            e.departamento.codigo = :codigoLimpeza
            OR LOWER(e.departamento.nome) LIKE '%limpeza%'
        )
        """
    )
    List<Escala> findLimpezaNoPeriodo(
        @Param("igrejaId") Long igrejaId,
        @Param("inicio") Instant inicio,
        @Param("fim") Instant fim,
        @Param("status") StatusEscalaPublicacao status,
        @Param("codigoLimpeza") CodigoDepartamento codigoLimpeza
    );

    @Query(
        "SELECT COUNT(ei) FROM EscalaItem ei JOIN ei.escala e WHERE e.departamento.id = :departamentoId " +
        "AND e.status = :status AND e.dataEvento >= :desde AND ei.user.id = :userId"
    )
    long countServicosUsuarioDesde(
        @Param("departamentoId") Long departamentoId,
        @Param("userId") Long userId,
        @Param("status") StatusEscalaPublicacao status,
        @Param("desde") Instant desde
    );

    /**
     * Cargas históricas agregadas (departamento × usuário) — evita N+1 no sorteio automático.
     */
    @Query(
        """
        SELECT e.departamento.id, ei.user.id, COUNT(ei)
        FROM EscalaItem ei
        JOIN ei.escala e
        WHERE e.departamento.id IN :departamentoIds
          AND e.status = :status
          AND e.dataEvento >= :desde
        GROUP BY e.departamento.id, ei.user.id
        """
    )
    List<Object[]> contarServicosAgrupadosDesde(
        @Param("departamentoIds") Collection<Long> departamentoIds,
        @Param("status") StatusEscalaPublicacao status,
        @Param("desde") Instant desde
    );
}
