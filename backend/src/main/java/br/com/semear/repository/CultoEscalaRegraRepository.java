package br.com.semear.repository;

import br.com.semear.domain.CultoEscalaRegra;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CultoEscalaRegraRepository extends JpaRepository<CultoEscalaRegra, Long> {
    List<CultoEscalaRegra> findByCultoRegistroId(Long cultoRegistroId);

    @Query(
        """
        SELECT r FROM CultoEscalaRegra r
        JOIN FETCH r.cultoRegistro
        LEFT JOIN FETCH r.departamento
        WHERE r.cultoRegistro.id IN :cultoIds
        """
    )
    List<CultoEscalaRegra> findByCultoRegistroIdInWithDepartamento(@Param("cultoIds") Collection<Long> cultoIds);

    void deleteByCultoRegistroId(Long cultoRegistroId);
}
