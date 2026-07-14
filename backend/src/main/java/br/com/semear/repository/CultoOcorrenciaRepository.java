package br.com.semear.repository;

import br.com.semear.domain.CultoOcorrencia;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CultoOcorrenciaRepository extends JpaRepository<CultoOcorrencia, Long> {
    Optional<CultoOcorrencia> findByIdAndIgrejaId(Long id, Long igrejaId);

    Optional<CultoOcorrencia> findByCultoRegistroIdAndDataEvento(Long cultoRegistroId, LocalDate dataEvento);

    @Query(
        """
        SELECT o FROM CultoOcorrencia o
        JOIN FETCH o.cultoRegistro
        LEFT JOIN FETCH o.grupoLouvorOrigem
        WHERE o.igreja.id = :igrejaId
        AND o.dataEvento BETWEEN :inicio AND :fim
        ORDER BY o.dataEvento ASC
        """
    )
    List<CultoOcorrencia> findByIgrejaIdAndDataEventoBetweenOrderByDataEventoAsc(
        @Param("igrejaId") Long igrejaId,
        @Param("inicio") LocalDate inicio,
        @Param("fim") LocalDate fim
    );
}
